<script>
    import { createEventDispatcher } from 'svelte'; 
import { OverflowMenu, OverflowMenuItem } from "carbon-components-svelte";
import Add from "carbon-icons-svelte/lib/Add.svelte";
import {widgetTemplates} from "../templates/widgetTemplates";

export let amountofcards = 3;
let direction = "bottom";

$: if(amountofcards > 2) {
    direction = "top"
}
else {direction = "bottom"}


const dispatch = createEventDispatcher();

</script>

<div class="fast" style="background-color: grey; color:white;">
    <div class="actions">
    </div>
    <h3>
    <OverflowMenu icon={Add} direction={direction}>

        {#each widgetTemplates as template }
           <OverflowMenuItem text={template.name} on:click={()=>{dispatch("addbytemplate",{template})}}/>
        {/each}
        
      </OverflowMenu>
    </h3>  
    
</div>

  <style>
   h3 {
        margin: 0;
        padding: 0;
		font-size: 1.8em;
		font-weight: 300;
        text-align:center;
        align-items: center;
	}

    .fast {
        padding: 1rem;
        margin: 1rem;
        border: 0px solid #ececec;
        border-radius: .5rem;
        width: 100%;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
    }

    .actions {
        justify-content: flex-end;
        display: flex;
    }

    :root {
    --c: goldenrod;
}


</style>