<template>
  <ion-app>
    <ion-split-pane content-id="main-content">
      <ion-menu content-id="main-content" type="overlay">
        <ion-content>
          <ion-list id="inbox-list">
            <ion-list-header>Web3.0 Wallet</ion-list-header>
            <ion-note class="ion-padding-start">laobei.com</ion-note>

            <ion-menu-toggle :auto-hide="false" v-for="(p, i) in appPages" :key="i">
              <ion-item @click="selectedIndex = i" router-direction="root" :router-link="p.url" lines="none" :detail="false" class="hydrated" :class="{ selected: selectedIndex === i }">
                <ion-icon aria-hidden="true" slot="start" :ios="p.iosIcon" :md="p.mdIcon"></ion-icon>
                <ion-label>{{ p.title }}</ion-label>
              </ion-item>
            </ion-menu-toggle>
          </ion-list>

        </ion-content>
      </ion-menu>
      <ion-router-outlet id="main-content"></ion-router-outlet>
    </ion-split-pane>
    <!-- <ion-router-outlet /> -->
  </ion-app>
</template>

<script lang="ts">
import { IonApp, IonRouterOutlet, IonListHeader, IonNote, IonIcon, IonLabel, IonItem, IonMenu, IonMenuToggle, IonContent, IonSplitPane, IonList } from "@ionic/vue";
import { defineComponent, onBeforeMount, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { getSettings } from "@/utils/platform";
import { ref } from 'vue';
import { personCircle, walletOutline, diamondOutline, cogOutline, receiptOutline, gitNetworkOutline, serverOutline } from "ionicons/icons";


export default defineComponent({
  name: "App",
  components: {
    IonApp,
    IonRouterOutlet,
    IonListHeader, IonNote, IonIcon, IonLabel, IonItem, IonMenu, IonMenuToggle, IonContent, IonSplitPane, IonList
  },
  setup() {
    const route = useRoute();
    const router = useRouter();
    const { param, rid } = route.query;

    const selectedIndex = ref(0);
    const appPages = [
      {
        title: 'Wallet',
        url: '/tabs/home',
        iosIcon: walletOutline,
        mdIcon: walletOutline,
      },
      {
        title: 'Accounts',
        url: '/tabs/accounts',
        iosIcon: personCircle,
        mdIcon: personCircle,
      },
      {
        title: 'Tokens',
        url: '/tabs/tokens',
        iosIcon: serverOutline,
        mdIcon: serverOutline,
      },
      {
        title: 'NFTs',
        url: '/tabs/nfts',
        iosIcon: diamondOutline,
        mdIcon: diamondOutline,
      },
      {
        title: 'History',
        url: '/tabs/history',
        iosIcon: receiptOutline,
        mdIcon: receiptOutline,
      },
      {
        title: 'Networks',
        url: '/tabs/networks',
        iosIcon: gitNetworkOutline,
        mdIcon: gitNetworkOutline,
      },
      {
        title: 'Settings',
        url: '/tabs/settings',
        iosIcon: cogOutline,
        mdIcon: cogOutline,
      },
    ];
    const labels = ['Family', 'Friends', 'Notes', 'Work', 'Travel', 'Reminders'];

    const path = window.location.pathname.split('folder/')[1];
    if (path !== undefined) {
      selectedIndex.value = appPages.findIndex((page) => page.title.toLowerCase() === path.toLowerCase());
    };

    onBeforeMount(() => {
      getSettings().then((settings) => {
        if (settings.theme !== "system") {
          document.body.classList.remove(settings.theme === "dark" ? "light" : "dark");
          document.body.classList.add(settings.theme);
        }
      });
    });

    onMounted(() => {
      switch (route?.query?.route ?? "") {
        case "sign-msg": {
          router.push({
            path: `/sign-msg/${rid}/${param}`,
          });
          break;
        }
        case "sign-tx": {
          router.push({
            path: `/sign-tx/${rid}/${param}`,
          });
          break;
        }
        case "switch-network": {
          router.push({
            path: `/switch-network/${rid}/${param}`,
          });
          break;
        }
        case "request-network": {
          router.push({
            path: `/request-network/${rid}/${param}`,
          });
          break;
        }
        case "wallet-error": {
          router.push({
            path: `/wallet-error/${rid}/${param}`,
          });
          break;
        }
        default: {
          router.push({ path: "/" });
        }
      }
    });

    return {
      appPages,
      labels,
      selectedIndex
    }
  },
});
</script>

<style scoped>
ion-menu ion-content {
  --background: var(--ion-item-background, var(--ion-background-color, #fff));
}

ion-menu.md ion-content {
  --padding-start: 8px;
  --padding-end: 8px;
  --padding-top: 20px;
  --padding-bottom: 20px;
}

ion-menu.md ion-list {
  padding: 20px 0;
}

ion-menu.md ion-note {
  margin-bottom: 30px;
}

ion-menu.md ion-list-header,
ion-menu.md ion-note {
  padding-left: 10px;
}

ion-menu.md ion-list#inbox-list {
  border-bottom: 1px solid var(--ion-color-step-150, #d7d8da);
}

ion-menu.md ion-list#inbox-list ion-list-header {
  font-size: 22px;
  font-weight: 600;

  min-height: 20px;
}

ion-menu.md ion-list#labels-list ion-list-header {
  font-size: 16px;

  margin-bottom: 18px;

  color: #757575;

  min-height: 26px;
}

ion-menu.md ion-item {
  --padding-start: 10px;
  --padding-end: 10px;
  border-radius: 4px;
}

ion-menu.md ion-item.selected {
  --background: rgba(var(--ion-color-primary-rgb), 0.14);
}

ion-menu.md ion-item.selected ion-icon {
  color: var(--ion-color-primary);
}

ion-menu.md ion-item ion-icon {
  color: #616e7e;
}

ion-menu.md ion-item ion-label {
  font-weight: 500;
}

ion-menu.ios ion-content {
  --padding-bottom: 20px;
}

ion-menu.ios ion-list {
  padding: 35px 0 0 0;
}

ion-menu.ios ion-note {
  line-height: 24px;
  margin-bottom: 20px;
}

ion-menu.ios ion-item {
  --padding-start: 16px;
  --padding-end: 16px;
  --min-height: 50px;
}

ion-menu.ios ion-item.selected ion-icon {
  color: var(--ion-color-primary);
}

ion-menu.ios ion-item ion-icon {
  font-size: 24px;
  color: #73849a;
}

ion-menu.ios ion-list#labels-list ion-list-header {
  margin-bottom: 8px;
}

ion-menu.ios ion-list-header,
ion-menu.ios ion-note {
  padding-left: 16px;
  padding-right: 16px;
}

ion-menu.ios ion-note {
  margin-bottom: 8px;
}

ion-note {
  display: inline-block;
  font-size: 16px;

  color: var(--ion-color-medium-shade);
}

ion-item.selected {
  --color: var(--ion-color-primary);
}
</style>
