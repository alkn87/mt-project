<script lang="ts">
  import {closeModal, Modals, openModal} from 'svelte-modals';
  import ClaimSelection from './ClaimSelection.svelte';
  import {getCurrentSigner, getWriteMapClaimContract,} from '$lib/blockchain-connection';
  import {getProvider} from '$lib/blockchain-connection/connection';
  import {onDestroy, onMount} from "svelte";
  import {JsonRpcProvider} from "ethers";
  import type {MapClaim} from "blockchain";

  const mapClaimContract = getWriteMapClaimContract()

  let accountAddress;
  let userName: string;

  let changeSetId = 0;
  let mapClaims: MapClaim.MapClaimTokenStruct[] = [];

  let listener: Promise<JsonRpcProvider>;
  let eventListener: Promise<MapClaim>;

  onMount(async () => {
    accountAddress = await (await getCurrentSigner()).getAddress();


    getMapClaims();

    listener = getProvider().on('block', async () => {
      console.log('new block');
      await getMapClaims();
    });

    eventListener = mapClaimContract.then(mapClaimContract => {
      return mapClaimContract.addListener(mapClaimContract.filters.MapClaimEvent, (status, mapClaimId) => {
        console.log('MapClaimEvent ' + status + ' - ' + mapClaimId);
        getMapClaims();
      });
    });

  })

  onDestroy(async () => {
    console.log('off');
    listener.then(listener => listener.off('block'));
    eventListener.then(eventListener => eventListener.off(eventListener.filters.MapClaimEvent));
  })

  async function createClaim(userName) {
    mapClaimContract.then(mapClaimContract => {
      mapClaimContract.createMapClaim(userName);
    });
  }

  async function activateClaim(tokenId) {
    openModal(ClaimSelection, {
      tokenId, action: async (selectedChangeSetId) => {
        mapClaimContract.then(mapClaimContract => {
          mapClaimContract.activateClaim(tokenId, selectedChangeSetId);
        });
      }
    });
  }

  async function getMapClaims() {
    mapClaims = await parseMapClaims();
  }

  async function parseMapClaims(): Promise<MapClaim.MapClaimTokenStruct[]> {
    const contract = await mapClaimContract;
    const amount = BigInt(await contract.balanceOf(accountAddress));

    if (amount <= BigInt(0)) {
      return [];
    }

    const claimsPromises: Promise<MapClaim.MapClaimTokenStruct>[] = [];

    for (let index = 0; BigInt(index) < amount; index++) {
      const promise = contract.tokenOfOwnerByIndex(accountAddress, index)
        .then(tokenId => contract.getMapClaimById(tokenId));
      claimsPromises.push(promise);
    }

    return await Promise.all(claimsPromises);
  }

</script>

<Modals>
    <div
            slot="backdrop"
            class="backdrop"
            on:click={closeModal}></div>
</Modals>

<h1 class="text-3xl font-bold underline p-4">Map Claims</h1>

<div class="container p-4">
    <div class="w-1/2">
        <label for="userNameInput">Enter user name</label>
        <input id="userNameInput" class="input" bind:value={userName} placeholder="your user name here">
        <button on:click={createClaim(userName)} class="btn">Create Claim</button>
        <button on:click={getMapClaims} class="btn">Get my Claims</button>
    </div>
</div>

{#if BigInt(mapClaims.length) === BigInt(0)}
    <h6>No MapClaims available</h6>
{/if}

<div class="container p-4">
    {#each mapClaims as mapClaim}
        <div class="flex border-dashed border-2 border-sky-500 mt-6">
            <div class="h-8 px-5 m-2">Map Claim ID: {mapClaim.mapClaimId}</div>
            <div class="h-8 px-5 m-2">Map User: {mapClaim.mapUserName}</div>
            <div class="h-8 px-5 m-2">Mint Strike: {mapClaim.mintStrike}</div>
            <div class="h-8 px-5 m-2">Status: {mapClaim.status}</div>
            <div>
                {#if BigInt(mapClaim.status) === BigInt(0)}
                    <button on:click={activateClaim(mapClaim.mapClaimId)} class="btn">Activate Claim</button>
                {/if}
            </div>

        </div>
    {/each}
</div>

<style>
    .backdrop {
        position: fixed;
        top: 0;
        bottom: 0;
        right: 0;
        left: 0;
        background: rgba(0, 0, 0, 0.50)
    }
</style>
