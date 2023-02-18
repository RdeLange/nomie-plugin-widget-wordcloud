<script>
  import { onMount } from "svelte";
  
  export let words = [{ text: "Nomie", count: 100 },{ text: "Test", count: 50 },{ text: "RdL", count: 75 }];
  export let wctheme = "none";
  export let plugin;


  let wcwords = [{ text: "Loading", size: 9 }];
  let widthrefreshed = true

  $: if (words) {
    calculateSize();
    widthrefreshed=false;
    setTimeout(()=>{widthrefreshed = true}, 5);
    }

    

  function calculateSize() {
    var wcwordstemp = [];
    var fontMin = 1;
    var fontMax = 9;
    var max = 1; // Should be computed
    var min = 0;   // Should be computed
    for (var i in words)
      {   if (i==0) {
            max = words[i].count;
            min = words[i].count; }
          if (words[i].count > max) {max = words[i].count ;}
          if (words[i].count < min) {min = words[i].count ;}
      }
    
    for (var i in words)
      {
          var word = words[i];

          var size = word.count == min ? fontMin
              : (word.count / max) * (fontMax - fontMin) + fontMin;
          wcwordstemp.push({text:word.text,size:size})    
      }
      wcwords = wcwordstemp;
  }

  function wordclicked(word) {
    //Interact.alert("Coming Soon","You will soon be able to directly go to the Connection");
    let item= word.text.toLowerCase();
    if (wctheme == "persons"){
      let note2nomie = "@"+item;+" ";
      plugin.openNoteEditor(note2nomie);
    }
     if (wctheme == "journals"){
     //Interact.journal(item);
    } 

  }

  onMount(() => {
    calculateSize();})

</script>

<style>

  
ul.cloud {
  list-style: none;
  padding-left: 0;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  line-height: 1.25rem;
  width: 100%;
  height: 100%;
}

ul.cloud a {
  /*   
  Not supported by any browser at the moment :(
  --size: attr(data-weight number); 
  */
  --size: 4;
  --color: #a33;
  color: var(--color);
  font-size: calc(var(--size) * 0.25rem + 0.5rem);
  display: block;
  padding: 0.125rem 0.25rem;
  position: relative;
  text-decoration: none;
  /* 
  For different tones of a single color
  opacity: calc((15 - (9 - var(--size))) / 15); 
  */
  pointer-events: none;
  cursor: default;
}

ul.cloud a[data-weight="1"] { --size: 1; }
ul.cloud a[data-weight="2"] { --size: 2; }
ul.cloud a[data-weight="3"] { --size: 3; }
ul.cloud a[data-weight="4"] { --size: 4; }
ul.cloud a[data-weight="5"] { --size: 6; }
ul.cloud a[data-weight="6"] { --size: 6; }
ul.cloud a[data-weight="7"] { --size: 7; }
ul.cloud a[data-weight="8"] { --size: 8; }
ul.cloud a[data-weight="9"] { --size: 9; }


ul.cloud li:nth-child(2n+1) a { --color: #181; }
ul.cloud li:nth-child(3n+1) a { --color: #33a; }
ul.cloud li:nth-child(4n+1) a { --color: #c38; }

ul.cloud a:focus {
  outline: 1px dashed;
}

ul.cloud a::before {
  content: "";
  position: absolute;
  top: 0;
  left: 50%;
  width: 0;
  height: 100%;
  background: var(--color);
  transform: translate(-50%, 0);
  opacity: 0.15;
  transition: width 0.25s;
}

ul.cloud a:focus::before,
ul.cloud a:hover::before {
  width: 100%;
}

@media (prefers-reduced-motion) {
  ul.cloud * {
    transition: none !important;
  }
}
</style>

{#if widthrefreshed}
  <div>
    <ul class="cloud" role="navigation" aria-label="Webdev word cloud">
      {#each wcwords as wcword, index (index)}
      <li style="cursor:pointer" on:click={() => {
        wordclicked(wcword); 
      }}><a href="#" data-weight={wcword.size}>{wcword.text}</a></li>
      {/each} 
  </ul>
  </div>
{/if}

