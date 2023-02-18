<script>
    import { createEventDispatcher } from 'svelte';
    import ColorPicker from '../components/ColorPicker.svelte';
    import {
      Button,
      Content,
        Grid,
        Row,
        Column,
        TextArea,
        Tile,
        Select, SelectItem
    } from "carbon-components-svelte";
    import EmojiPicker from "../components/emojiPicker.svelte"
   
    export let pluginname;
    export let pluginemoji;
    export let widget;
    export let theme;

    const dispatch = createEventDispatcher();
   
   if (theme == "g90"){
    document.documentElement.style.setProperty('--date-picker-background', "#4A4A4B");
    document.documentElement.style.setProperty('--date-picker-foreground', "#f7f7f7");
    document.documentElement.style.setProperty('--date-input-width', "100px");
   }

   if (theme == "g10"){
    document.documentElement.style.setProperty('--date-picker-background', "#E2E3E2");
    document.documentElement.style.setProperty('--date-picker-foreground', "#272727");
    document.documentElement.style.setProperty('--date-input-width', "100px");
   }

   var disablebutton = true;
   var keywords = loadKeywords();

   $: if(!widget.name || !widget.description) {
    disablebutton = true;
   }
   else {disablebutton = false}

   function loadKeywords() {
    let keywordstring = "";
    for (var keyword of widget.config.wckeywords) {
      keywordstring = keywordstring +keyword+",";
    }
    keywordstring = keywordstring.slice(0, -1);
    return keywordstring;
  }


   function onEmojiChange(event) {
    widget.emoji = event.detail.emoji;
  }

  function updateWidget() {
    widget.config.wckeywords = keywords.split(',')
    dispatch("updatewidget");
  }

  
</script>

<Content>
    <Grid>
      <Row>
        <Column>
          <h1 style="text-align:center">{pluginemoji}</h1>
          <h2 style="text-align:center">{pluginname}</h2>
          <h5 style="text-align:center">Edit Widget</h5>
          <hr>
        </Column>
      </Row>
    </Grid>
    <TextArea rows={1} maxCount={20} labelText="Name" placeholder="Enter Name..." bind:value={widget.name}/>
        <TextArea rows={2} maxCount={200} labelText="Widget description" placeholder="Enter a description..." bind:value={widget.description}/>
        <TextArea rows={4} maxCount={1000} labelText="Widget keywords" placeholder="Enter keywords..." bind:value={keywords}/>
        
        <br>
        <Tile>
        <p>Color:</p>
        <br>
        <ColorPicker bind:theme={theme} bind:value={widget.color}></ColorPicker>
      </Tile>
        <br>
        <Tile>
      <div class="row">
          <div class="column" style="width:40%">
        <p>Emoji:</p>
        <br>
        <h2><EmojiPicker on:change={onEmojiChange}/> {widget.emoji}</h2>
        </div>
        </div>
      </Tile>
        <br>
      <Tile>
        <div class="row">
        <p>Time Range:</p>
        <br>
        <Select hideLabel labelText="Carbon theme" bind:selected={widget.days}>
          <SelectItem value="10" text="Last 10 Days" />
          <SelectItem value="20" text="Last 20 Days" />
          <SelectItem value="30" text="Last 30 Days" />
          <SelectItem value="60" text="Last 60 Days" />
          <SelectItem value="90" text="Last 90 Days" />
        </Select>
        </div>
      </Tile>  
        <br>
        <Row>
          <Column>
              <br>
               <span><Button kind="secondary" on:click={()=>{dispatch("exitedit")}} style="float: left;">Exit</Button></span>
               <br>
          </Column>
        <Column>
            <br>
             <span><Button disabled={disablebutton} on:click={()=>{updateWidget()}} style="float: right;">Save</Button></span>
             <br>
        </Column>
    </Row>    
  </Content>



  <style>

:root {
  --date-picker-background: #4A4A4B;
  --date-picker-foreground: #f7f7f7;
}
    h2 {
       margin: 0;
       padding: 0;
       font-size: 2.5em;
       font-weight: 400;
   }

   .column {
  float: left;
  width: 50%;
}

/* Clear floats after the columns */
.row:after {
  content: "";
  display: table;
  clear: both;
}

 </style>

