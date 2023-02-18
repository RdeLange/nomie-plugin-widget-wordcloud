<script>
  import { onMount } from 'svelte';
  import "carbon-components-svelte/css/all.css";
  import Toast from './components/toast.svelte'
  import {notifications} from './components/notifications.js'
  import {
    Header,
    HeaderUtilities,
    HeaderGlobalAction,
    SkipToContent,
    Content,
    Grid,
    Row,
    Column,
    Theme,
    Button,
  } from "carbon-components-svelte";
  import nid from "./modules/nid/nid";
  import Main from "./pages/main.svelte";
  import Info from "./pages/info.svelte";
  import Settings from "./pages/settings.svelte";
  import Edit from "./pages/main-edit.svelte";
  import SettingsAdjust from "carbon-icons-svelte/lib/SettingsAdjust.svelte";
  import Sun from "carbon-icons-svelte/lib/Sun.svelte";
  import Information from "carbon-icons-svelte/lib/Information.svelte";
  import Widget from "./components/widget.svelte"

  let WidgetIndex = "1";
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.has("widgetindex")){
    WidgetIndex = urlParams.get("widgetindex");}
    
  const pluginname = "Nomie Wordcloud";
  const pluginemoji = "☁️";
  var parent = "Nomie";
  var Widgets = [];
  var WidgetsEdit = [];
  let amountofcards = 0;
  let widget2edit = 0;
  let isEditMode = false;
  
  const plugin = new NomiePlugin({
        name: pluginname,
        emoji: pluginemoji,
        description: "Nomie WordCloud Widgets Plugin",
        uses: ["searchNotes"],
        version: "0.1",
        addToCaptureMenu: true,
        addToMoreMenu: true,
        addToWidgets: true,
      }); 
  let inNomie = false;
  let theme = "g10";
  let mode = "hidden";
  let loading = true;
  let view = "main";

  // Load init params
  function loadInitParams() {
    plugin.onUIOpened(async () => {
      mode = 'modal';
    });

    plugin.onWidget(() => {
      if (plugin.prefs.theme == "light" || plugin.prefs.theme == "auto" ) {
        theme = "white"}
      else if (plugin.prefs.theme == "dark") {
        theme = "g100"}  
      else {theme = "g10"} 
      mode = "widget";
    });

    plugin.onRegistered(async () => {
      await plugin.storage.init()
      Widgets = plugin.storage.getItem('widgets') || [{"widgetid":"1", "name":"Emotions","emoji":"🥴","color":"#C47ADA","config":{"wctheme":"emotions","wctimerange":"90"}},{"widgetid":"2", "name":"Virtues","emoji":"✋","color":"#C47ADA","config":{"wctheme":"virtues","wctimerange":"90"}},{"widgetid":"3", "name":"Persons","emoji":"👨‍👩‍👧‍👦","color":"#C47ADA","config":{"wctheme":"persons","wctimerange":"90"}}];
      WidgetsEdit = Widgets;
      if (Widgets.length == 3){
      plugin.storage.setItem('widgets',Widgets);}
      
      if (plugin.prefs.theme == "light") {
        theme = "g10"}
      else if (plugin.prefs.theme == "dark") {
        theme = "g90"}  
      else {theme = "g10"} 
    })

  setTimeout(() => {
      inNomie = true;
      loading = false;
    }, 700);
  }

  // change theme
  function toggleTheme(){
    if (theme == "white"){
      theme = "g10"}
    else if (theme == "g10"){
      theme = "g80"}
    else if (theme == "g80"){
      theme = "g90"}
    else if (theme == "g90"){
      theme = "g100"}
    else {
      theme = "white"}
 }

//view main page
function showMain(){
  view = "main"
  window.scrollTo(0,0);
 }
 
 //view info page
 function showInformation(){
  view = "info"
  window.scrollTo(0,0);
 }

 //view settings page
 function showSettings(){
  view = "settings"
  window.scrollTo(0,0);
 }

 function saveSettings(){
  showMain();
 }

 const addByTemplate = (event) => {
  const widget = {
				widgetid: nid(),
				name : event.detail.detail.template.name,
        description: event.detail.detail.template.description,
				color: event.detail.detail.template.color,
        emoji: event.detail.detail.template.emoji,
        config: {"wctheme":"custom","wctimerange": event.detail.detail.template.days,"wckeywords":event.detail.detail.template.keywords}
			};
			Widgets = Widgets.concat(widget);
			saveWidgets(Widgets);

}

const saveWidgets = Widgets=> {
    plugin.storage.setItem('widgets', Widgets);
    WidgetsEdit = Widgets;
    amountofcards = Widgets.length;
}

const deletewidget = async event => {
    let res = await plugin.confirm('Delete Wordcloud Widget Config?', 'Are you sure you want to delete this Wordcloud Widget configuration?');
if(res.value) {

    const id=event.detail;
		//find widget by id
		let index = Widgets.findIndex(widget => widget.widgetid === id);
		//remove widget
		Widgets.splice(index, 1);
		Widgets = [...Widgets];
		saveWidgets(Widgets);
  } else {
	//nothing to do;
}
}

const editMode = (event) => {
  const widgetId=event.detail;
		
		//find widgetindex by id
		const findwidgetindex = (element) => element.widgetid == widgetId;
    widget2edit = Widgets.findIndex(findwidgetindex);
    isEditMode = true;
    view="mainedit";
}


const updatewidget = () => {
		Widgets = WidgetsEdit;
		saveWidgets(Widgets);
    view="main";
    isEditMode = false;
};

const backtolastsave = () => {
  WidgetsEdit = Widgets;
  view="main";
  isEditMode = false;
}


 onMount(async () => {
  loadInitParams();
 })

</script>

{#if mode == "modal"  || mode =="widget"}
<Theme bind:theme />
{#if inNomie}
{#if mode == "modal"}
<Header company={parent} platformName={pluginname} on:click={showMain}>
  <svelte:fragment slot="skip-to-content">
    <SkipToContent />
  </svelte:fragment>
  <HeaderUtilities>
    <HeaderGlobalAction aria-label="Settings" icon={SettingsAdjust} on:click={showSettings}/>
    <HeaderGlobalAction aria-label="Theme" icon={Sun} on:click={toggleTheme}/>
    <HeaderGlobalAction aria-label="Theme" icon={Information} on:click={showInformation}/>
  </HeaderUtilities>
</Header>

{#if view == "main"}
<Main pluginname={pluginname} pluginemoji={pluginemoji} bind:widgets={WidgetsEdit} bind:theme={theme} on:addbytemplate={addByTemplate} on:deletewidget={deletewidget} on:editwidget={editMode}/>
{:else if view == "info"}
<Info parent={parent} pluginname={pluginname} pluginemoji={pluginemoji} on:exitinfo={showMain}/>
{:else if view == "settings"}
<Settings pluginname={pluginname} pluginemoji={pluginemoji} on:exitsettings={showMain} on:savesettings={saveSettings}/>
{:else if view == "mainedit"}
<Edit pluginname={pluginname} pluginemoji={pluginemoji} bind:widget={WidgetsEdit[widget2edit]} bind:theme={theme} on:updatewidget={updatewidget} on:exitedit={backtolastsave} ></Edit>
{/if}
{:else if mode == "widget"}
<Widget bind:Widgets={Widgets} bind:WidgetIndex={WidgetIndex} plugin={plugin}></Widget>
{/if}
{/if}

{:else if !inNomie}
        <h1 style="text-align:center">{pluginemoji}</h1>
        <h2 style="text-align:center">{pluginname}</h2>
        <h5 style="text-align:center">This is a plugin for Nomie</h5>
        <hr>
{/if}
{#if loading}
<div class="startup">
<p>Loading....</p>
</div>
{/if}
<Toast/>
