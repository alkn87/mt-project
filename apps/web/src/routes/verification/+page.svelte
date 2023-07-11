<script lang="ts">
  import {getCurrentSigner, getWriteMapClaimContract} from '$lib/blockchain-connection';
  import {onMount} from "svelte";
  import type {MapClaim} from "blockchain";

  const signer = getCurrentSigner();
  const mapClaimContract = getWriteMapClaimContract();

  let hasRole: boolean;
  let mapClaims: MapClaim.MapClaimTokenStructOutput[] = [];

  onMount(async () => {
    hasRole = await (await mapClaimContract).hasRole((await mapClaimContract).VERIFIER_ROLE(), await (await signer).getAddress());
    mapClaims = await (await mapClaimContract).getAllMapClaims();
  });

  async function rewardClaim(mapClaimId: number) {
    await (await mapClaimContract).rewardClaim(mapClaimId).catch(err => console.log(err));
  }

  async function rejectClaim(mapClaimId: number) {
    await (await mapClaimContract).rejectClaim(mapClaimId).catch(err => console.log(err));
  }
</script>

<h1 class="text-3xl font-bold underline p-4">Verify Map Claims</h1>
<div class="container p-4">
{#each mapClaims as mapClaim}
    <div class="flex border-dashed border-2 border-sky-500 mt-6">
        <div class="h-8 px-5 m-2">Map Claim ID: {mapClaim.mapClaimId}</div>
        <div class="h-8 px-5 m-2">Map User: {mapClaim.mapUserName}</div>
        <div class="h-8 px-5 m-2">Mint Strike: {mapClaim.mintStrike}</div>
        <div class="h-8 px-5 m-2">Status: {mapClaim.status}</div>
        <div>
            {#if mapClaim.status === 2}
                <button on:click={rewardClaim(mapClaim.mapClaimId)} class="btn">Reward Claim</button>
                <button on:click={rejectClaim(mapClaim.mapClaimId)} class="btn">Reject Claim</button>
            {/if}
        </div>
    </div>
{/each}
</div>
