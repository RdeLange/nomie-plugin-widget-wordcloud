<script>
  import { onMount } from "svelte";
  import { wordcloudtemplates } from "./widget-wordcloud-templates";
  import Wordcloud from "./wordcloud.svelte";

  export let Widgets;
  export let WidgetIndex;
  export let plugin;

  var showwidget = false;
  let wctemplates =[];
  let wcwords = [{text:"Loading",count:20}];
  let wctheme = "";
  let wctimerange = 90;
  let wckeywords = "no_keywords_found";
  let wclabel = "";
  let wcemoji = "";
  let bgcolor = "white";
  

async function initwidget() {
  await addPersons();
  if (plugin.prefs.theme == "light" || plugin.prefs.theme == "auto"){
    bgcolor = "white"
  }
  else {bgcolor = "black"}
  //insert code
  let index = WidgetIndex;
  let Widget = Widgets.find((p) => p.widgetid == index);
  if (Widget) {
  wctheme = Widget.config.wctheme;
  wctimerange = Widget.config.wctimerange;
  wclabel = Widget.name;
  wcemoji = Widget.emoji;}
  else {
    Widget = {"widgetid":"4567", "name":"Placeholder","emoji":"🙈","color":"#C47ADA","config":{"wctheme":"custom","wctimerange":"90","wckeywords":["nomie6","wordcloud"]}}
  }
  if (wctheme == "custom") {
  wckeywords = Widget.config.wckeywords;
  await addCustom()}
  wcwords = await buildWCArray()
  //end insertcode 
  showwidget = true;
}

async function addCustom(){
  let tempterms = wckeywords;
  if (tempterms.length == 0) {tempterms = ["no_keywords_found"]}
    wctemplates[1]={wordcloudname: "custom",
    displayName: "Custom Wordcloud",
    notes: "These are all customized keywords",
    terms: tempterms};
}

async function addPersons() {
    wctemplates = wordcloudtemplates;
    let tempterms=[];
    // Search all notes
    const allNotes = await plugin.searchNotes('', new Date(), 90);
      // Filter out only notes with elements that have a person
    const peopleNotes = allNotes.filter(note => {
        return note.elements.find(e => e.type == 'person')
      })
    // Loop over the people notes
    peopleNotes.forEach((note) => {
        // Loop over the elements of the notes
        // filter out on people
        note.elements.filter(e => e.type == 'person').forEach((ele) => {
          if (!tempterms.includes(ele.id)){
          tempterms.push(ele.id)}})})
   
    if (tempterms.length == 0) {tempterms = ["no_people_found"]}
    wctemplates[0]={wordcloudname: "persons",
    displayName: "Persons",
    notes: "These are all terms related to persons",
    terms: tempterms};
  }

async function buildWCArray(){
  let wcarray = [];
    const thistheme = wctemplates.find(element => element.wordcloudname == wctheme);
    for (const wcterm of thistheme.terms){
     var counts = await count(wcterm,wctimerange);
      if (counts > 0){
        wcarray.push({text:wcterm,count:counts});}
  }
  return wcarray;
}

async function count(searchterm,timerange){
    let result = 0;
    let searchstring = searchterm;
    const notes = await plugin.searchNotes(searchstring, new Date(), parseInt(timerange) );
    if (notes) {
      let total = notes.length;
      result = total
    }
    else {result = 0}
    return result;
}



onMount(
  ()=>{
    initwidget();
  }
)

</script>

<style>
.extra-outer-wrapper {
		width: 100%;
		margin: 0 auto;
    height: 83%;
    color:#50B0EF;
	}

	.outer-wrapper {
		width: 100%;
		position: relative;
    height: 100%
	}
	
	.inner-wrapper {
		width: 100%;
    height: 100%;
		display: flex;
		position: absolute;
    
	}

	.content {
		flex: 0 0 auto;
		width: 100%;
		height: 100%;
	  align-items: center;
		justify-content: center;
		display: flex;
		text-align: center;
		font-weight: bold;
		font-size: 2rem;
		color: white;
    border-radius:10px;
    background:transparent;
	}

 
</style>

{#if showwidget}
<div class="extra-outer-wrapper" style="background:{bgcolor}">
  <p style="margin-left:3%;font-weight:700">{wcemoji} {wclabel}</p>
	<div class="outer-wrapper" style="background:{bgcolor}">
 		<div class="inner-wrapper" style="background:{bgcolor}">
			<div class="content" style="background:{bgcolor}">
        <Wordcloud
        bind:words={wcwords} bind:wctheme={wctheme} plugin={plugin}/>
        </div>
		</div>
	</div>
</div>
 {/if}