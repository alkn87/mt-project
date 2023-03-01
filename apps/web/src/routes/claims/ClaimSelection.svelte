<script lang="ts">
    import { closeModal } from 'svelte-modals'

    let changeSetId: number = 0;

    export let isOpen: boolean;

    export let tokenId: Number;
    export let action: (id: number) => void

    async function handleClick(changeSetId: number) {
      await action(changeSetId);
      console.log('changeset: ' + changeSetId);
      console.log('tokenId: ' + tokenId);
      closeModal()
    }
</script>

{#if isOpen}
    <div role="dialog" class="modal">
        <div class="contents">
            <h2>Activate Claim</h2>
            <div class="list-group">
                <div>Activation request for claim with id: {tokenId}</div>
                <label for="changeSetId">Enter change set ID</label>
                <input id="changeSetId" class="input" bind:value={changeSetId} placeholder="your claimed changeset id here">
                <button on:click={() => handleClick(changeSetId)} class="btn">Activate</button>
            </div>
        </div>
    </div>
{/if}
