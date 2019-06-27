function DataExtension(viewer, options) {
  Autodesk.Viewing.Extension.call(this, viewer, options);
}

DataExtension.prototype = Object.create(Autodesk.Viewing.Extension.prototype);
DataExtension.prototype.constructor = DataExtension;


  function statusCallback(completed, message) {
    $.notify(message, { className: "info", position:"bottom right" });
    $('#downloadExcel').prop("disabled", !completed);
  }


DataExtension.prototype.load = function () {
  var _viewer = this.viewer;


  // get Forge token (use your data:read endpoint here)
  // this sample is using client-side JavaScript only, so no
  // back-end that authenticate with Forge nor files, therefore
  // is using files from another sample. On your implementation,
  // you should replace this with your own Token endpoint
  function getForgeToken(callback) {
    jQuery.ajax({
      url: '/forge/oauth/token',
      success: function (oauth) {
        if (callback)
          callback(oauth.access_token, oauth.expires_in);
      }
    });
  }


  createUI = function () {
    // Button 1
    var button1 = new Autodesk.Viewing.UI.Button('toolbarXLS');
    button1.onClick = function (e) {
        // ForgeXLS.downloadXLSX(documentId, fileName + ".xlsx", token, statusCallback, fileType );/*Optional*/
        var panel = new SimplePanel(viewer.container, 'Data', 'AllPropertiesPanel', 'All Properties',10,10);
        panel.setVisible(true);
    };
    button1.addClass('toolbarXLSButton');
    button1.setToolTip('Export to .XLSX');

    // SubToolbar
    this.subToolbar = new Autodesk.Viewing.UI.ControlGroup('myAppGroup1');
    this.subToolbar.addControl(button1);

    _viewer.toolbar.addControl(this.subToolbar);
  };

  createUI();

  return true;
};

SimplePanel = function(parentContainer, id, title, content, x, y)
{
this.content = content;
Autodesk.Viewing.UI.DockingPanel.call(this, parentContainer, id, '');

// Auto-fit to the content and don't allow resize.  Position at the coordinates given.
//
this.container.style.height = "auto";
this.container.style.width = "auto";
this.container.style.resize = "none";
this.container.style.left = x + "px";
this.container.style.top = y + "px";
this.container.style.background = "black";
};

SimplePanel.prototype = Object.create(Autodesk.Viewing.UI.DockingPanel.prototype);
SimplePanel.prototype.constructor = SimplePanel;

SimplePanel.prototype.initialize = function()
{
// Override DockingPanel initialize() to:
// - create a standard title bar
// - click anywhere on the panel to move
// - create a close element at the bottom right
//
this.title = this.createTitleBar(this.titleLabel || this.container.id);
this.container.appendChild(this.title);
var div = document.createElement('div');
div.innerHTML = '<table class="table">'+
                  '<thead>'+
                    '<tr>'+
                      '<th>Building</th>'+
                      '<th>Phase</th>'+
                      '<th>Status</th>'+
                    '</tr>'+
                  '</thead>'+
                  '<tbody>'+
                    '<tr>'+
                     ' <td>Building1</td>'+
                      '<td>phase1</td>'+
                      '<td>completed</td>'+
                   ' </tr>'+
                    '<tr>'+
                      '<td>Building2</td>'+
                      '<td>phase2</td>'+
                     ' <td>partial</td>'+
                   ' </tr>'+
                    '<tr>'+
                      '<td>Building3</td>'+
                      '<td>phase3</td>'+
                      '<td>not started</td>'+
                    '</tr>'+
                  '</tbody>'+
                  '</table>'
this.container.appendChild(div);
this.initializeMoveHandlers(this.container);

this.closer = document.createElement("div");
this.closer.className = 'closer';
this.closer.textContent = "Close";
this.initializeCloseHandler(this.closer);
this.container.appendChild(this.closer);
};

DataExtension.prototype.unload = function () {
  alert('DataExtension is now unloaded!');
  return true;
};

Autodesk.Viewing.theExtensionManager.registerExtension('Autodesk.Sample.DataExtension', DataExtension);
