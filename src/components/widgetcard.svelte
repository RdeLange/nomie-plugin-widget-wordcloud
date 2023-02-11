<script>
  export let widget = {
                widgetid: "",
				name : "",
				emoji: "",
                days: "",
                color: "",
                keywords:[],
    }
  export let deleteWidget;
  export let editWidget;
  export let theme;

var cardlabel = widget.name;
var bgcolor = "black";
if (cardlabel.length >10){ cardlabel = cardlabel.slice(0, 10)+'...';}
if(theme=="g10"){
		bgcolor = "black"
	}
	else {bgcolor = "white"}



</script>

<svg viewBox='0 0 105 105' on:click={editWidget} style="cursor: pointer">
    <path style="fill:{widget.color};stroke:{bgcolor}" d='M 25,60 
             a 20,20 1 0,0 0,40 
             h 50 
             a 20,20 1 0,0 0,-40 
             a 10,10 1 0,0 -15,-10 
             a 15,15 1 0,0 -35,10  
             z' />
             <text x="50%" y="85" dominant-baseline="middle" text-anchor="middle" class="label" on:click|preventDefault|stopPropagation={editWidget}>{widget.emoji}{cardlabel}</text>
             <text x="33%" y="57" class="trash" on:click|preventDefault|stopPropagation={deleteWidget}>🗑️</text>
  </svg>

  <style> 
  
  :root {
    --c: goldenrod;
}

.label {
      font: normal 12px sans-serif;
      cursor: pointer;
    }
.trash {
      font: bold 15px sans-serif;
      cursor: pointer;
    }
    svg {
  height: 35%;
  width: 35%;
}
path {
  fill: var(--c);
  fill-opacity: 0.7;
  stroke: var(--c);
  stroke-width: 2;
  stroke-linejoin: round;
}
path:hover {
  fill: var(--c);
  fill-opacity: 0.7;
  stroke: var(--c);
}
</style>