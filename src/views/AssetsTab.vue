<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-menu-button color="primary"></ion-menu-button>
        </ion-buttons>
        <ion-title>Assets</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <ion-refresher slot="fixed" @ionRefresh="handleRefresh($event)">
        <ion-refresher-content></ion-refresher-content>
      </ion-refresher>
      <ion-loading
        :is-open="loading"
        cssClass="my-custom-class"
        message="Please wait..."
        :duration="4000"
        :key="`k${loading}`"
        @didDismiss="loading = false"
      >
      </ion-loading>
      <ion-toast
        :is-open="toastState"
        @didDismiss="toastState = false"
        message="Copied to clipboard"
        :duration="1500"
      ></ion-toast>

      <ion-item>
        <ion-label>Assests for Account: {{ selectedAccount?.name }}</ion-label>
      </ion-item>
      <ion-item button @click="copyAddress(selectedAccount?.address, getToastRef())">
        <p style="font-size: 0.7rem">{{ selectedAccount?.address }}</p>
        <ion-icon style="margin-left: 0.5rem" :icon="copyOutline"></ion-icon>
      </ion-item>
      <template v-if="isError">
        Assets info could not be retrieved because of an http error, API down or
        conectivity issues.
      </template>
      <template v-else-if="noAssets"> No assets found for this wallet address. </template>
      <template v-else>
        <template v-if="ethTokens.length || polyTokens.length">
          <template v-if="ethTokens.length">
            <!-- <ion-item>Ethereum Tokens</ion-item> -->
            <ion-list>
              <ion-list-header>
                <ion-label>Ethereum Tokens</ion-label>
              </ion-list-header>
                <ion-item v-for="token of ethTokens" :key="token.address">
                <ion-avatar
                  v-if="token?.image"
                  style="margin-right: 1rem; width: 1.8rem; height: 1.8rem"
                >
                  <img
                    :alt="token?.name"
                    :src="token?.image"
                    @error="token.image = getUrl('assets/randomGrad.svg')"
                  />
                </ion-avatar>
                <ion-label
                  ><b>{{ token?.symbol }}:</b> {{ token?.balance }}</ion-label
                >
              </ion-item>
              <ion-item v-if="hasMore.ethTokens">
                <ion-button @click="loadMore('ethTokens')">Load More</ion-button>
              </ion-item>
            </ion-list>
          </template>

          <template v-if="polyTokens.length">
            <ion-item>Polygon Tokens</ion-item>
            <ion-list>
              <ion-item v-for="token of polyTokens" :key="token.address">
                <ion-avatar
                  v-if="token?.image"
                  style="margin-right: 1rem; width: 1.8rem; height: 1.8rem"
                >
                  <img
                    :alt="token?.name"
                    :src="token?.image"
                    @error="token.image = getUrl('assets/randomGrad.svg')"
                  />
                </ion-avatar>
                <ion-label
                  ><b>{{ token?.symbol }}:</b> {{ token?.balance }}</ion-label
                >
              </ion-item>
              <ion-item v-if="hasMore.polyTokens">
                <ion-button @click="loadMore('polyTokens')">Load More</ion-button>
              </ion-item>
            </ion-list>
          </template>
        </template>
      </template>
    </ion-content>
  </ion-page>
</template>

<script lang="ts">
import { defineComponent, Ref, ref, reactive } from "vue";
import {
  IonContent,
  IonRefresher,
  IonRefresherContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  onIonViewWillEnter,
  IonItem,
  IonLabel,
  IonAvatar,
  IonList,
  IonListHeader,
  IonButton,
  IonToast,
  IonLoading,
  IonIcon,
  IonButtons,
  IonMenuButton
} from "@ionic/vue";
import { getSelectedAccount, copyAddress, getUrl, storageGet, storageSave, getSelectedNetwork } from "@/utils/platform";
import type { Account } from "@/extension/types";

import { copyOutline } from "ionicons/icons";
import { Alchemy, Network } from "alchemy-sdk";
import { mainNets, testNets } from "@/utils/networks";

interface IProfileToken {
  address: string;
  balance: number;
  image: string;
  name: string;
  symbol: string;
}

interface IProfileNFT {
  address: string;
  collectionImageURI: string;
  collectionName: string;
  imageURI: string;
  link: string;
  tokenId: number;
}

interface IProfilePOAP {
  description: string;
  eventId: string;
  image: string;
  link: string;
  title: string;
}

export default defineComponent({
  components: {
    IonContent,
    IonRefresher,
    IonRefresherContent,
    IonHeader,
    IonPage,
    IonTitle,
    IonToolbar,
    IonItem,
    IonLabel,
    IonAvatar,
    IonList,
    IonListHeader,
    IonButton,
    IonToast,
    IonLoading,
    IonIcon,
    IonButtons,
    IonMenuButton
  },
  setup: () => {
    const selectedAccount = ref({}) as Ref<Account>;
    const loading = ref(true);
    const isError = ref(false);
    const noAssets = ref(false);
    const toastState = ref(false);
    const ethTokens = ref([]) as Ref<IProfileToken[]>;
    const polyTokens = ref([]) as Ref<IProfileToken[]>;
    const ethNfts = ref([]) as Ref<IProfileNFT[]>;
    const polyNfts = ref([]) as Ref<IProfileNFT[]>;
    const poaps = ref([]) as Ref<IProfilePOAP[]>;
    const hasMore = reactive({
      poaps: true,
      ethTokens: true,
      polyTokens: true,
      ethNfts: true,
      polyNfts: true,
    });
    const getToastRef = () => toastState;

    const resources = ["nfts", "poaps", "tokens"];
    const chains = ["ethereum", "polygon"];

    const fetchFromWallet = async ({
      address,
      resource = resources[0],
      chain = chains[0],
      start = 0,
      limit = 10,
    }: {
      address: string;
      resource?: string;
      chain?: string;
      start?: number;
      limit?: number;
    }) => {
      try {
        let tokens = []
        if (chain == 'ethereum' && resource == 'tokens') {
          const network = await getSelectedNetwork()

          const key = 'balances-' + network.chainId + '-' + address
          let balances = await storageGet(key)
          balances = balances[key]

          let config = {}
          if (network.chainId in mainNets) {
            config = {
              apiKey: mainNets[network.chainId].apiKey!,
              network: mainNets[network.chainId].network,
            }
          } else {
            config = {
              apiKey: testNets[network.chainId].apiKey!,
              network: testNets[network.chainId].network,
            }
          }
          const alchemy = new Alchemy(config);

          if (!balances) {
            balances = await alchemy.core.getTokenBalances(address);
            const nonZeroBalances = balances.tokenBalances.filter((token: { tokenBalance: string; }) => {
              return token.tokenBalance !== "0x0000000000000000000000000000000000000000000000000000000000000000";
            });
            await storageSave(key, nonZeroBalances)
            balances = nonZeroBalances
          }
          // console.log(balances)
          // console.log(start, limit)
          
          for (let i = start; i < balances.length && i < start + limit; i++) {
            let token = balances[i]
            let balance = token.tokenBalance
            let metaKey = 'meta-' + network.chainId + '-' + token.contractAddress
            let metadata = await storageGet(metaKey)
            metadata = metadata[metaKey]

            if (!metadata) {
              metadata = await alchemy.core.getTokenMetadata(token.contractAddress)
              await storageSave(metaKey, metadata)
            }
            
            balance = balance / Math.pow(10, metadata.decimals!)
            balance = balance.toFixed(18)

            // console.log(`${i}. ${metadata.name}: ${balance} ${metadata.symbol}`)
            const item = {
              address: address,
              balance: balance,
              balanceUSD: 0,
              chain: chain,
              image: metadata.logo,
              keywords: ["ethereum", "eth"],
              name: metadata.name,
              symbol: metadata.symbol ?? metadata.name
            }
            tokens.push(item)
          }
        }

        return tokens
      } catch (error) {
        console.error("Failed to fetch web3 profiles", error);
        return null;
      }
    };

    const fetchEthNftsFromWallet = async ({
      address,
      resource = resources[0],
      chain = chains[0],
      start = 0,
      limit = 10,
    }: {
      address: string;
      resource?: string;
      chain?: string;
      start?: number;
      limit?: number;
    }) => {
      try {
        let tokens = []
        if (chain != 'ethereum' || resource != 'nfts') {
          return []
        }
        const network = await getSelectedNetwork()

        const key = 'ethnfts-' + network.chainId + '-' + address
        let ethnfts = await storageGet(key)
        ethnfts = ethnfts[key]

        const config = {
          apiKey: network.apiKey!,
          network: network.network,
        }
        const alchemy = new Alchemy(config);

        if (!ethnfts) {
          ethnfts = await alchemy.nft.getNftsForOwner(address);
          ethnfts = ethnfts["ownedNfts"]
          await storageSave(key, ethnfts)
        }
        // console.log(ethnfts)
        // console.log(start, limit)
        
        for (let i = start; i < ethnfts.length && i < start + limit; i++) {
          let nft = ethnfts[i]
          const item = {
            imageURI: nft.media[0].thumbnail,
            collectionName: nft.title,
          }
          tokens.push(item)
        }

        return tokens
      } catch (error) {
        console.error("Failed to fetch web3 profiles", error);
        return null;
      }
    };

    const walletLoadArgs = {
      address: "",
      start: 0,
      limit: 5,
      res: resources,
      ch: chains,
      apiBase: "https://api.yup.io",
    };

    const getProfileWallet = async ({
      address,
      start,
      limit,
      res,
      ch,
      apiBase,
    }: {
      address: string;
      start: number;
      limit: number;
      res: string[];
      ch: string[];
      apiBase: string;
    }) => {
      const r = {
        poaps: [] as IProfilePOAP[],
        ethNfts: [] as IProfileNFT[],
        polyNfts: [] as IProfileNFT[],
        ethTokens: [] as IProfileToken[],
        polyTokens: [] as IProfileToken[],
      };
      try {
        const promises = [];

        if (res.includes("poaps")) {
          promises.push(
            fetchFromWallet({
              address,
              start,
              limit,
              resource: "poaps",
              chain: "ethereum",
            }).then((rz) => {
              r.poaps = rz ?? [];
            })
          );
        }
        if (res.includes("nfts")) {
          if (ch.includes("ethereum")) {
            promises.push(
              fetchEthNftsFromWallet({
                address,
                start,
                limit,
                resource: "nfts",
                chain: "ethereum",
              }).then((rz) => {
                r.ethNfts = rz ?? [];
              })
            );
          }
          if (ch.includes("polygon")) {
            promises.push(
              fetchFromWallet({
                address,
                start,
                limit,
                resource: "nfts",
                chain: "polygon",
              }).then((rz) => {
                r.polyNfts = rz ?? [];
              })
            );
          }
        }
        if (res.includes("tokens")) {
          if (ch.includes("ethereum")) {
            promises.push(
              fetchFromWallet({
                address,
                start,
                limit,
                resource: "tokens",
                chain: "ethereum",
              }).then((rz) => {
                r.ethTokens = rz ?? [];
              })
            );
          }
          if (ch.includes("polygon")) {
            promises.push(
              fetchFromWallet({
                address,
                start,
                limit,
                resource: "tokens",
                chain: "polygon",
              }).then((rz) => {
                r.polyTokens = rz ?? [];
              })
            );
          }
        }

        await Promise.all(promises);
        return r;
      } catch {
        return r;
      }
    };

    const clearLocalStorage = async (address: string) => {
      const network = await getSelectedNetwork()
      let key = 'balances-' + network.chainId + '-' + address
      let balances = await storageGet(key)
      balances = balances[key]
      for (let i = 0; balances && i < balances.length; i++) {
            let metaKey = 'meta-' + network.chainId + '-' + balances[i].contractAddress
            await localStorage.removeItem(metaKey)
      }

      await localStorage.removeItem(key)
    };

    const callRefereshWallet = async (event: CustomEvent) => {
      selectedAccount.value = await getSelectedAccount();
      walletLoadArgs.address = selectedAccount.value.address;

      clearLocalStorage(walletLoadArgs.address)

      const r = await getProfileWallet(walletLoadArgs);
      ethNfts.value = r.ethNfts.slice(0, 10);
      if (r.ethNfts.length !== walletLoadArgs.limit) {
        hasMore.ethNfts = false;
      }
      ethTokens.value = r.ethTokens.slice(0, 10);
      if (r.ethTokens.length !== walletLoadArgs.limit) {
        hasMore.ethTokens = false;
      }
      event.target.complete();
    };

    onIonViewWillEnter(async () => {
      selectedAccount.value = await getSelectedAccount();
      walletLoadArgs.address = selectedAccount.value.address;
      const r = await getProfileWallet(walletLoadArgs);
      ethNfts.value = r.ethNfts.slice(0, 10);
      if (r.ethNfts.length !== walletLoadArgs.limit) {
        hasMore.ethNfts = false;
      }
      polyNfts.value = r.polyNfts.slice(0, 10);
      if (r.polyNfts.length !== walletLoadArgs.limit) {
        hasMore.polyNfts = false;
      }
      ethTokens.value = r.ethTokens.slice(0, 10);
      if (r.ethTokens.length !== walletLoadArgs.limit) {
        hasMore.ethTokens = false;
      }
      polyTokens.value = r.polyTokens.slice(0, 10);
      if (r.polyTokens.length !== walletLoadArgs.limit) {
        hasMore.polyTokens = false;
      }
      poaps.value = r.poaps.slice(0, -1);
      if (r.poaps.length !== walletLoadArgs.limit) {
        hasMore.poaps = false;
      }
      noAssets.value =
        poaps.value.length ||
        ethNfts.value.length ||
        polyNfts.value.length ||
        ethTokens.value.length ||
        polyTokens.value.length
          ? false
          : true;
      loading.value = false;
    });



    const loadMore = async (type: string) => {
      switch (type) {
        case "ethTokens": {
          walletLoadArgs.start = ethTokens.value.length;
          walletLoadArgs.res = ["tokens"];
          walletLoadArgs.ch = ["ethereum"];
          const r = await getProfileWallet(walletLoadArgs);
          if (r.ethTokens.length !== walletLoadArgs.limit) {
            hasMore.ethTokens = false;
            return;
          }
          ethTokens.value = [...ethTokens.value, ...r.ethTokens.slice(0, 10)];
          break;
        }
        case "polyTokens": {
          walletLoadArgs.start = polyTokens.value.length;
          walletLoadArgs.res = ["tokens"];
          walletLoadArgs.ch = ["polygon"];
          const r = await getProfileWallet(walletLoadArgs);
          if (r.polyTokens.length !== walletLoadArgs.limit) {
            hasMore.polyTokens = false;
            return;
          }
          polyTokens.value = [...polyTokens.value, ...r.polyTokens.slice(0, 10)];
          break;
        }
        case "ethNfts": {
          walletLoadArgs.start = ethNfts.value.length;
          walletLoadArgs.res = ["nfts"];
          walletLoadArgs.ch = ["ethereum"];
          const r = await getProfileWallet(walletLoadArgs);
          if (r.ethNfts.length !== walletLoadArgs.limit) {
            hasMore.ethNfts = false;
            return;
          }
          ethNfts.value = [...ethNfts.value, ...r.ethNfts.slice(0, 10)];
          break;
        }
        case "polyNfts": {
          walletLoadArgs.start = polyNfts.value.length;
          walletLoadArgs.res = ["nfts"];
          walletLoadArgs.ch = ["polygon"];
          const r = await getProfileWallet(walletLoadArgs);
          if (r.polyNfts.length !== walletLoadArgs.limit) {
            hasMore.polyNfts = false;
            return;
          }
          polyNfts.value = [...polyNfts.value, ...r.polyNfts.slice(0, 10)];
          break;
        }
        case "poaps": {
          walletLoadArgs.start = poaps.value.length;
          walletLoadArgs.res = ["poaps"];
          walletLoadArgs.ch = ["ethereum"];
          const r = await getProfileWallet(walletLoadArgs);
          if (r.poaps.length !== walletLoadArgs.limit) {
            hasMore.poaps = false;
            return;
          }
          poaps.value = [...poaps.value, ...r.poaps.slice(0, 10)];
          break;
        }
      }
    };

    const handleRefresh = async (event: CustomEvent) => {
      await callRefereshWallet(event)
      // setTimeout(() => {
      //   event.target.complete();
      // }, 2000);
    };

    return {
      selectedAccount,
      loading,
      isError,
      noAssets,
      getToastRef,
      copyAddress,
      copyOutline,
      ethTokens,
      polyTokens,
      ethNfts,
      poaps,
      hasMore,
      polyNfts,
      loadMore,
      toastState,
      getUrl,
      handleRefresh
    };
  },
});
</script>
