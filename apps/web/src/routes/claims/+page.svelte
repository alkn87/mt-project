<script lang="ts">
  import { Modals, closeModal, openModal } from 'svelte-modals';
  import ClaimSelection from './ClaimSelection.svelte';
  import {
    getWriteMapClaimContract,
    getWriteVerificationOracleContract
  } from '$lib/blockchain-connection';
  import type { MapClaim } from 'blockchain';
  import { BigNumber, Wallet } from 'ethers';
  import { getProvider } from '$lib/blockchain-connection/connection';
  import { onDestroy, onMount } from 'svelte';

  const mapClaimContract = getWriteMapClaimContract()
  const verificationOracleContract = getWriteVerificationOracleContract()

  let accountAddress: string;

  onMount(async () => {
    accountAddress = await mapClaimContract.signer.getAddress();
  })

  let changeSetId = 0;
  let mapClaims: MapClaim.MapClaimTokenStructOutput[] = [];
  getMapClaims();

  const listener = getProvider().on('block', async () => {
    console.log('new block');
    await getMapClaims();
  })

  const verifiedListener = mapClaimContract.on('MapClaimEvent', async (status, mapClaimId) => {
    console.log('MapClaimEvent ' + status + ' - ' + mapClaimId);
    await getMapClaims();
  });


  // TODO: This is a dummy implementation for the mint strike verification oracle node
  // change it to a separate application
  const oracleListener = verificationOracleContract.then(contract => {
    contract.on('VerifyMintStrike', (senderAddress, mintStrike, changeSetId, mapUserName, mapClaimId) => {
      verifyClaim(mapClaimId);
    });
  });


  onDestroy(() => {
    console.log('off');
    listener.off('block');
  })

  async function createClaim() {
    (await mapClaimContract.createMapClaim('max', {
      gasLimit: 1_000_000
    })).wait();
  }

  // async function activateClaim(tokenId: Number, changeSetId: number) {
  //   (await mapClaimContract.activateClaim(BigNumber.from(tokenId), BigNumber.from(changeSetId), {
  //     gasLimit: 1_000_000
  //   })).wait();
  // }

  async function activateClaim(tokenId: Number) {
    openModal(ClaimSelection, {tokenId, action: async (selectedChangeSetId) => {
        await mapClaimContract.activateClaim(BigNumber.from(tokenId), BigNumber.from(selectedChangeSetId), {
          gasLimit: 1_000_000
        });
    }});
  }

  async function verifyClaim(mapClaimId) {
    const provider = getProvider();
    const signer = provider.getSigner();
    mapClaimContract.connect(signer);
    const signerWallet = new Wallet('0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80', provider);

    const accountNonce =
      '0x' + (await signerWallet.getTransactionCount()).toString(16)

    let verifyClaimTxData = {
      from: signerWallet.address,
      gasLimit: 1_000_000,
      gasPrice: await provider.getGasPrice(),
      nonce: accountNonce
    }

    let tx = await mapClaimContract.populateTransaction.verifyClaim(mapClaimId, verifyClaimTxData);
    let signedTx = await signerWallet.signTransaction(tx);
    await provider.sendTransaction(signedTx);
  }

  async function getMapClaims() {
    mapClaims = await parseMapClaims();
  }

  async function parseMapClaims(): Promise<MapClaim.MapClaimTokenStructOutput[]> {
    let claims: MapClaim.MapClaimTokenStructOutput[] = [];
    await mapClaimContract.connect(accountAddress).balanceOf(accountAddress).then(async amount => {
      if (amount <= 0) {
        return;
      }
      let index = 0;
      while (index < amount.toNumber()) {
        await mapClaimContract.connect(accountAddress).tokenOfOwnerByIndex(accountAddress, index).then(async tokenId => {
          let tokenStruct = await mapClaimContract.connect(accountAddress).getMapClaimById(tokenId);
          claims.push(tokenStruct);
        });
        index++;
      }
    });
    return claims;
  }

</script>

<Modals>
    <div
            slot="backdrop"
            class="backdrop"
            on:click={closeModal}></div>
</Modals>

<h1 class="text-3xl font-bold underline">Map Claims</h1>

<div class="flex">
    <button on:click={createClaim} class="btn">Create Claim</button>
    <button on:click={getMapClaims} class="btn">Get my Claims</button>
</div>

{#if mapClaims.length === 0}
    <h6>No MapClaims available</h6>
{/if}

{#each mapClaims as mapClaim}
    <div class="flex border-dashed border-2 border-sky-500 mt-6">
        <div class="h-8 px-5 m-2">Map Claim ID: {mapClaim.mapClaimId}</div>
        <div class="h-8 px-5 m-2">Map User: {mapClaim.mapUserName}</div>
        <div class="h-8 px-5 m-2">Mint Strike: {mapClaim.mintStrike}</div>
        <div class="h-8 px-5 m-2">Status: {mapClaim.status}</div>
        <div>
            {#if mapClaim.status === 0}
<!--                <button on:click={activateClaim(mapClaim.mapClaimId, changeSetId)} class="btn">Activate Claim</button>-->
                <button on:click={activateClaim(mapClaim.mapClaimId)} class="btn">Activate Claim</button>
            {/if}
        </div>

    </div>
{/each}

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
