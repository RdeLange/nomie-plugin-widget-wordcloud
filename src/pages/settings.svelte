<script>
    import { createEventDispatcher } from 'svelte';
    import {
      Button,
      Content,
        Grid,
        Row,
        Column,
    } from "carbon-components-svelte";
   
    export let pluginname;
    export let pluginemoji;

   let open=true;
   
   const dispatch = createEventDispatcher();

   function exitSettings(){
        dispatch("exitsettings");
        open = false;
    }

    function saveSettings(){
        dispatch("savesettings");
        dispatch("exitsettings");
        open = false;
    } 
</script>

<Content>
    <Grid>
      <Row>
        <Column>
          <h1 style="text-align:center">{pluginemoji}</h1>
          <h2 style="text-align:center">{pluginname}</h2>
          <h5 style="text-align:center">Plugin Settings</h5>
          <hr>
        </Column>
      </Row>
    </Grid>
    <Row>
      <br>
      <br>
      <h4>There are no specific settings available for this plugin</h4>
</Row>
  </Content>



  <style>
    h2 {
       margin: 0;
       padding: 0;
       font-size: 2.5em;
       font-weight: 400;
   }

 </style>

