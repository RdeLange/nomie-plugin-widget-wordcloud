<script>
    import { createEventDispatcher } from 'svelte';
    import {
      Button,
      Content,
        Grid,
        Row,
        Column,
        Tile,
    } from "carbon-components-svelte";
    import WidgetCard from "../components/widgetcard.svelte";
    import AddCard from "../components/addcard.svelte";
   
    export let pluginname;
    export let pluginemoji;
    export let widgets = [];
    export let theme;

    let amountofcards = widgets.length;

   let open=true;
   
   const dispatch = createEventDispatcher();

   function deletewidget(id){
      dispatch("deletewidget",id)
    }

    function editwidget(id){
      dispatch("editwidget",id)
    }

   function exitMain(){
        dispatch("exitinfo");
        open = false;
    }
</script>

<Content>
    <Grid>
      <Row>
        <Column>
          <h1 style="text-align:center">{pluginemoji}</h1>
          <h2 style="text-align:center">{pluginname}</h2>
          <h5 style="text-align:center">Loaded Succesfully</h5>
          <hr>
        </Column>
      </Row>
      <Row>
        <Column>
    <div class="container">    
      <div>
        
        <div class="widgets-list">
          {#if widgets.length < 4}
          <Tile>
            <p class="no-widgets">
              No Wordcloud Widgets? Oh dear, please add one to enhance your dashboard. 
            </p>
            
          </Tile>
          {:else}
            {#each widgets as widget}
            {#if widget.widgetid.length > 3}
              <WidgetCard
                theme={theme}
                widget={widget}
                deleteWidget={() => deletewidget(widget.widgetid)}
                editWidget={() => editwidget(widget.widgetid)}
                />
              {/if}  
            {/each}
          {/if}
          <AddCard bind:amountofcards={amountofcards} on:addnew={()=>{dispatch("addnew")}} on:addbytemplate={(event)=>{dispatch("addbytemplate",event)}}/>
          
        </div>
      </div>
    </div>
      </Column>
      </Row>
    </Grid>
  </Content>



  <style>
    h2 {
       margin: 0;
       padding: 0;
       font-size: 2.5em;
       font-weight: 400;
   }

   .widgets-list {
  z-index: 0;
  width: 100%;
  display: flex;
  justify-content: space-around;
  flex-wrap: wrap;
}

.container {
		display: flex;
		justify-content: space-around;
		margin: 1rem auto auto auto;
	}
	@media screen and (max-width: 720px) {
		.container {
			flex-direction: column;
		}
	}

  .no-widgets {
		padding: 1em;
    	border: 1px solid;
    	border-radius: 4px;
	}



 </style>

