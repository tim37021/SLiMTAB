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
      function zooming(scale,tags) {
			for(let i=0;i<tags.length;i++){
				tags[i].paper.setScale(scale/100);
				tags[i].paper.zoom();
			}
		document.getElementById("rangevalue").innerHTML=scale+"%";
      }
      
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