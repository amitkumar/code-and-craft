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