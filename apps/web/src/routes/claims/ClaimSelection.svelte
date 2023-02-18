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
                Activation request for claim with id: {tokenId}
                <input class="input" bind:value={changeSetId} placeholder="your claimed changeset id here">
                <button on:click={() => handleClick(changeSetId)} class="btn">Activate</button>
            </div>
        </div>
    </div>
{/if}

<style>
    .modal {
        position: fixed;
        top: 0;
        bottom: 0;
        right: 0;
        left: 0;
        display: flex;
        justify-content: center;
        align-items: center;

        /* allow click-through to backdrop */
        pointer-events: none;
    }

    .contents {
        min-width: 440px;
        border-radius: 6px;
        padding: 16px;
        background: white;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        pointer-events: auto;
    }

    h2 {
        text-align: center;
        font-size: 24px;
    }

    p {
        text-align: center;
        margin-top: 16px;
    }
</style>
