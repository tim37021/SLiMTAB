function showFileMenu(element, event) {
    if(document.getElementById("file_menu").style.display == "none")
		document.getElementById("file_menu").style.display = null;
    else
		document.getElementById("file_menu").style.display = "none";
        element.style.color = "#F39800";
    event.stopPropagation();
}
      function hideMenus() {
        document.getElementById("file_menu").style.display = "none";
        document.getElementById("file_menu_root").style.color =  null;
        Array.from(document.getElementsByClassName("dropdown-content")).forEach(function (x) {
          x.style.display = "none";
        })
      }
      var webview = document.querySelector('webview')
      function zooming(scale) {
        operTp.setScale(scale/100);
		operTp.zoom();
		document.getElementById("rangevalue").innerHTML=scale+"%";
      }
      interact('.draggable')
        .draggable({
            // enable inertial throwing
            inertia: true,
            // keep the element within the area of it's parent
            restrict: {
                restriction: "parent",
                endOnly: true,
                elementRect: { top: 0, left: 0, bottom: 1, right: 1 }
            },
            // enable autoScroll
            autoScroll: true,
            onstart: function (event) {
            },
            // call this function on every dragmove event
            onmove: dragMoveListener,
            // call this function on every dragend event
            onend: function (event) {
                // do the fucking sorting
                if(event.target.parentElement.id=='tabstrip') {
                  var tabstrip = document.getElementById('tabstrip')
                  var p = tabstrip.children[0]
                  list = []
                  i = 0
                  do {
                    list.push({idx: i, obj: p.cloneNode(true)})
                    i++
                  } while(p = p.nextElementSibling)

                  ll = list.sort(function(a, b) {
                    var ax = (parseFloat(a.obj.getAttribute('data-x')) || 0)+280*a.idx
                    var bx = (parseFloat(b.obj.getAttribute('data-x')) || 0)+280*b.idx
                    return ax-bx
                  })
                  console.log(ll)
                  tabstrip.innerHTML = ''
                  ll.forEach(function (e) {
                    e.obj.setAttribute('data-x', 0)
                    e.obj.setAttribute('data-y', 0)
                    e.obj.style.transform = null
                    tabstrip.appendChild(e.obj)
                  })
                }
            }
        });

      interact('.draggable2')
        .draggable({
            // enable inertial throwing
            inertia: false,
            // keep the element within the area of it's parent
            restrict: {
                restriction: "parent",
                endOnly: true,
                elementRect: { top: 0, left: 0, bottom: 1, right: 1 }
            },
            // enable autoScroll
            autoScroll: true,
            onstart: function (event) {
            },
            // call this function on every dragmove event
            onmove: dragMoveListener,
            // call this function on every dragend event
            onend: function (event) {
            }
        });
    function dragMoveListener (event) {
        console.log('dragMoveListener');
        var target = event.target,
            // keep the dragged position in the data-x/data-y attributes
            x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx,
            y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;
        // translate the element
        target.style.webkitTransform =
            target.style.transform =
                'translate(' + x + 'px, ' + y + 'px)';
        // update the position attributes
        target.setAttribute('data-x', x);
        target.setAttribute('data-y', y);
    }
        function changetab(element, event) {
          event.stopPropagation()
          var tabstrip = document.getElementById('tabstrip')
          var p = tabstrip.children[0]
          do {
            if(p == element)
              p.classList.add('tabediting')
            else
              p.classList.remove('tabediting')

          } while(p = p.nextElementSibling)
          webviews = document.querySelectorAll('webview')
          webviews.forEach(function(v) {
            v.classList.add('inactivetab')
          })
          webview = document.getElementById(element.id.substring(6))
          webview.classList.remove("inactivetab")
          webview.setZoomFactor(document.getElementById('rangeinput').value/100)
        }