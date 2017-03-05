//wait until the interface is generated before attaching event listeners.
new MutationObserver(function(mutations) {
  if(document.querySelector('[src="icons/compile.png"]')){
    document.querySelector('[src="icons/compile.png"]')
            .parentElement
            .addEventListener('click', event => {
                fetch('/compile',{
                  method: 'POST',
                  headers: {'Content-Type': 'application/json'},
                  body: JSON.stringify({
                    'source.txt': cm.getDoc().getValue()
                  }),
                  credentials: 'same-origin'
                })
            })
    this.disconnect()  
  }
}).observe(document.body, { attributes: true, childList: true, characterData: true });