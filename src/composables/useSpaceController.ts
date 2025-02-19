import { computed, ref } from 'vue';
import { useRoute } from 'vue-router';
import { getInstance } from '@snapshot-labs/lock/plugins/vue3';
import namehash from '@ensdomains/eth-ens-namehash';
import networks from '@snapshot-labs/snapshot.js/src/networks.json';
import { getAddress } from '@ethersproject/address';
import {
  sendTransaction,
  getEnsOwner,
  getSpaceController
} from '@snapshot-labs/snapshot.js/src/utils';

import { useI18n, useWeb3, useApp, useFlashNotification } from '@/composables';

const spaceControllerInput = ref('');
const modalUnsupportedNetworkOpen = ref(false);
const modalConfirmSetTextRecordOpen = ref(false);
const settingENSRecord = ref(false);
const pendingENSRecord = ref(false);
const ensOwner = ref<string | null>(null);
const spaceController = ref<string | null>(null);
const defaultNetwork = import.meta.env.VITE_DEFAULT_NETWORK;

export function useSpaceController() {
  const { web3, web3Account } = useWeb3();
  const auth = getInstance();
  const { t } = useI18n();
  const route = useRoute();
  const { domain } = useApp();
  const { notify } = useFlashNotification();

  const ensAbi = ['function setText(bytes32 node, string key, string value)'];

  const networkKey = computed(() => web3.value.network.key);

  const ensAddress = computed(
    () => domain || route.params.ens || route.params.key
  );

  const isEnsOwner = computed(
    () => ensOwner.value?.toLowerCase() === web3Account.value?.toLowerCase()
  );

  const isSpaceController = computed(
    () =>
      spaceController.value?.toLowerCase() === web3Account.value?.toLowerCase()
  );

  async function setRecord() {
    settingENSRecord.value = true;
    try {
      const ensPublicResolverAddress = networks[networkKey.value].ensResolver;
      if (!ensPublicResolverAddress) {
        throw new Error('No ENS resolver address for this network');
      }
      const ensname = ensAddress.value;
      const node = namehash.hash(ensname);
      const tx = await sendTransaction(
        auth.web3,
        ensPublicResolverAddress,
        ensAbi,
        'setText',
        [node, 'snapshot', getAddress(spaceControllerInput.value)]
      );
      settingENSRecord.value = false;
      notify(t('notify.transactionSent'));

      return tx;
    } catch (e) {
      notify(['red', t('notify.somethingWentWrong')]);
      console.log(e);
    } finally {
      settingENSRecord.value = false;
    }
  }

  function confirmSetRecord() {
    if (networkKey.value !== defaultNetwork)
      modalUnsupportedNetworkOpen.value = true;
    else modalConfirmSetTextRecordOpen.value = true;
  }

  async function loadEnsOwner() {
    ensOwner.value = await getEnsOwner(ensAddress.value, defaultNetwork);
  }

  async function loadSpaceController() {
    spaceController.value = await getSpaceController(
      ensAddress.value,
      defaultNetwork
    );
  }

  return {
    spaceControllerInput,
    settingENSRecord,
    pendingENSRecord,
    modalUnsupportedNetworkOpen,
    modalConfirmSetTextRecordOpen,
    setRecord,
    confirmSetRecord,
    ensAddress,
    loadEnsOwner,
    ensOwner,
    isEnsOwner,
    loadSpaceController,
    spaceController,
    isSpaceController
  };
}
