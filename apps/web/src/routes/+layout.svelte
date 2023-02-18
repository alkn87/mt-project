<script>
  import '../app.css';
  import { isConnectedToCorrectChain, isMetamaskConnected, NETWORK } from "$lib/blockchain-connection";
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";


  onMount(async () => {
      if(!(await isMetamaskConnected()) || !(await isConnectedToCorrectChain(NETWORK.chainId))){
        goto("/")
      }
  })
</script>

<main class="container">
  <div class="container">
    <slot />
  </div>
</main>
