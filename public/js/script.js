$(document).ready(() => console.log("ready"));

// Clear articles
$(document).on('click', '#delete', (req, res) => {
    $.ajax({
        url: '/delete-articles',
        method: 'DELETE'
    }).then((response) => window.location.replace('/'),
    $('#numArticles').css({ 'display': 'none' }))
    .catch(error => console.log(error));
})

// View saved articles
$(document).on('click', '#saved-articles', (req, res) => {
  $.ajax({
      url: '/saved',
      method: 'GET'
  }).then((response) => window.location.replace('/saved'))
  .catch(error => console.log(error));
})

// Scrape news
$(document).on('click', '#scrape', (req, res) => {
  $('#article-container').empty();
  $.ajax({
      url: '/scrape',
      method: 'GET',
      success: function (response) {
        $('#numArticles').text(response.count);
      }
  }).then((response) => window.location.replace('/'))
  .catch(error => console.log(error));
})

// Save article
$(document).on("click", ".save-article", function() {
    var thisId = $(this).parent().attr("data-id");
    $.ajax({
      method: "PUT",
      url: "/saved/" + thisId,
      data: {
        saved: {$get:true}
      }
    })
      .then((data) => {
        alert("Article Saved!!")
        window.location.reload();
      });
    })

// Add note
$(document).on("click", "#note-open", () => {
  var thisId = $(this).parent().attr("data-id");
  $.ajax({
    method: "POST",
    url: "/articles/" + thisId,
    data: {
      title: $(".titleinput").val(),
      body: $(".bodyinput").val()
    }
  })
    .then((data) => {
      if (data.note) {
        $(".titleinput").val(data.note.title);
        $(".bodyinput").val(data.note.body);
      }
    });
});

// Save note
$(document).on("click", "#savenote", function() {
  var thisId = $(this).attr("data-id");
  $.ajax({
    method: "POST",
    url: "/articles/" + thisId,
    data: {
      title: $("#titleinput").val(),
      body: $("#bodyinput").val()
    }
  })
    .then((data) => {
      $("#notes").empty();
    });
  $("#titleinput").val("");
  $("#bodyinput").val("");
  alert("Note Saved");
});

// show associated notes with the article
$(document).on("click", "#show-notes", function () {
  const dataID = $(this).data("id");
  $.get("/articles/" + dataID)
      .then(function (data) {
        const noteID = data.note._id;
        const noteTitle = data.note.title;
        const noteBody = data.note.body;
        const newNote = $('<div class="note">')
            .attr("data-id", noteID)
            .append("<p>" + noteTitle)
            .append("<p>" + noteBody)
            .append($("<div class='button' id='delete-note'>x</div>"));
        $("#note-holder").append(newNote);
      });
});

// Remove note
$(document).on("click", "#delete-note", function() {
  const note = $(this).parent();
  const thisId = $(this).parent().attr("data-id");
  $("#note-holder").empty();
  //console.log('clicked: ' + thisId)
  $.ajax({
    method: "DELETE",
    url: "/deletenote/" + thisId,
  })
    .then(function(data) {
    });
  alert("Note Deleted");
});