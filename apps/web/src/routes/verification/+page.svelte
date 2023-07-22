<script lang="ts">
  import {getCurrentSigner, getWriteMapClaimContract} from '$lib/blockchain-connection';
  import {onDestroy, onMount} from "svelte";
  import type {MapClaim} from "blockchain";

  const signer = getCurrentSigner();
  const mapClaimContract = getWriteMapClaimContract();

  let hasRole: boolean;
  let mapClaims: MapClaim.MapClaimTokenStructOutput[] = [];

  let eventListener: Promise<MapClaim>;

  onMount(async () => {
    hasRole = await mapClaimContract.then(async contract => {
      return contract.hasRole(contract.VERIFIER_ROLE(), (await signer).getAddress());
    });
    console.log(hasRole);

    eventListener = mapClaimContract.then(mapClaimContract => {
      return mapClaimContract.addListener(mapClaimContract.filters.MapClaimEvent, (status, mapClaimId) => {
        console.log('MapClaimEvent ' + status + ' - ' + mapClaimId);
        getMapClaims();
      });
    });

    await getMapClaims();
  });

  onDestroy(async () => {
    console.log('off');
    eventListener.then(eventListener => eventListener.off(eventListener.filters.MapClaimEvent));
  })

  async function getMapClaims() {
    mapClaimContract.then(contract => {
      return contract.getAllMapClaims();
    }).then(claims => {
      mapClaims = claims;
    }).catch(error => {
      console.log("Error while fetching map claims:", error);
      mapClaims = [];
    });
  }

  async function rewardClaim(mapClaimId: number) {

    mapClaimContract.then(contract => {
      contract.rewardClaim(mapClaimId).then(() => {
        console.log("Claim rewarded");
      }).catch(err => console.log(err));
    });
  }

  async function rejectClaim(mapClaimId: number) {

    mapClaimContract.then(contract => {
      contract.rejectClaim(mapClaimId).then(() => {
        console.log("Claim rejected");
      }).catch(err => console.log(err));
    });
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
            {#if BigInt(mapClaim.status) === BigInt(2)}
                <button on:click={rewardClaim(mapClaim.mapClaimId)} class="btn">Reward Claim</button>
                <button on:click={rejectClaim(mapClaim.mapClaimId)} class="btn">Reject Claim</button>
            {/if}
        </div>
    </div>
{/each}
</div>
