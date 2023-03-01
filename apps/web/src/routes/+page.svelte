<script lang="ts">
  import {
    switchAndAddEthereumChain,
    isMetamaskConnected,
    isConnectedToCorrectChain,
    connectAccounts,
    NETWORK
  } from '$lib/blockchain-connection';
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';


  const chain = NETWORK

  const MM_STATE = {
    NOT_CONNECTED: 0,
    CONNECTED: 1,
    CORRECT_CHAIN: 2
  } as const

  type MMValues = typeof MM_STATE[keyof typeof MM_STATE];

  let state: MMValues;

  onMount(async () => {
    await updateState()
    if (state === MM_STATE.CORRECT_CHAIN) {
      goto('/claims');
    }
  })


  async function updateState() {
    if (!(await isMetamaskConnected())) {
      state = MM_STATE.NOT_CONNECTED;
      return;
    }
    if (!(await (isConnectedToCorrectChain(chain.chainId)))) {
      state = MM_STATE.CONNECTED;
      return;
    }
    state = MM_STATE.CORRECT_CHAIN;
  }

  async function onclick() {
    switch (state) {
      case MM_STATE.NOT_CONNECTED:
        await connectAccounts()
        break
      case MM_STATE.CONNECTED:
        await switchAndAddEthereumChain(chain)
        break
      case MM_STATE.CORRECT_CHAIN:
        goto('/claims')
        break
    }
    updateState()
  }

  let name: string
  $: name = getName(state)

  function getName(state: MMValues) {
    switch (state) {
      case MM_STATE.NOT_CONNECTED:
        return 'Connect to Metamask'
      case MM_STATE.CONNECTED:
        return 'Connect to Chain'
      case MM_STATE.CORRECT_CHAIN:
        return 'Go to claims!'
    }
  }
</script>

<h1 class="text-3xl font-bold underline">Metamask Setup</h1>

<button class="btn-blue" on:click={onclick}>{name}</button>
