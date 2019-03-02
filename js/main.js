const apiURL = 'http://localhost:3000/';

/*
*********************
DRAG & DROP
*********************
 */

const dragStart = (event) => {
  event.dataTransfer.setData("text/plain", event.target.id);
}

const allowDrop = (event) => {
  event.preventDefault();
  event.currentTarget.style.background = '#7f8082';
}

const drop = (event) => {
  event.preventDefault();
  const data = event.dataTransfer.getData("text/plain");
  const element = document.querySelector(`#${data}`);
  event.currentTarget.style.background = 'white'
  try {
    event.target.appendChild(element);
  } catch (error) {
    console.warn("you can't move the item to the same place")
  }
}

// Page load event
$(document).ready(function() {
 	loadBoardData();
});

// Load all columns and cards
function loadBoardData(search="") {
	document.getElementById('column-list').innerHTML = '';

	// Get all columns
	fetch(apiURL+"columns")
		.then((resp) => resp.json()) // Transform the data into json
		.then(function(data) {
			// If there are no lists, show default message
			let columns = data;
			if(columns.length == 0) {
				var parent = document.getElementById('column-list');
				parent.innerHTML = "<div class='col text-center text-muted mt-5'><h3>Add a list from the menu bar <br>and start adding cards</h3></div>"
			}

			// If there are lists, Map through the results for each list and cards
			columns.map(function(column) {
				var parent = document.getElementById('column-list');
  				var newChild = createColumn(column);
  				parent.insertAdjacentHTML('beforeend', newChild);

  				var cardURL = (search != "") ? apiURL+"cards?columnId="+column.id+"&q="+search : apiURL+"cards?columnId="+column.id;
  				fetch(cardURL)
  					.then((resp) => resp.json())
  					.then(function(result) {
  						let cards = result;
						cards.map(function(card) {
							var parent = document.getElementById("card-list-"+column.id);
							var newChild = createCard(card);
							parent.insertAdjacentHTML('beforeend', newChild);
						});
  					});
		    });
		})
		.catch(function(error) {
			var parent = document.getElementById('column-list');
				parent.innerHTML = "<div class='col text-center text-muted mt-5'><h3>Something wen wrong :( <br>Please refresh the page and try again</h3></div>"
		});
}

// Create and return HTML template for a column
function createColumn(data) {
	const column_html = `
		<div class="col">
		    <div class="card mt-3">
		        <div class="card-header">
		            ${data.title}
		            <span class="float-right">
		            	<a href="#" class="card-link edit-list" data-id="${data.id}" data-title="${data.title}"><i class="far fa-edit"></i></a>
		            	<a href="#" class="card-link" onClick="deleteList(${data.id})"><i class="far fa-trash-alt"></i></a>
		            </span>
		        </div>
		        <div class="card-body main-card-body droppable" id="card-list-${data.id}" ondragover="allowDrop(event)" ondrop="drop(event)">
		        </div>
		        <div class="card-body">
		            <a class="collapse-link" data-toggle="collapse" href="#collapse${data.id}" role="button" aria-expanded="false" aria-controls="collapse${data.id}"><i class="fas fa-plus"></i> Add card</a>
		            <div class="collapse" id="collapse${data.id}">
		              <div class="card card-body form-card-body">
		                <form id="form${data.id}" class="card-form">
		                    <div class="form-group">
		                        <input type="text" name="title" class="form-control" placeholder="Enter title" required />
		                    </div>
		                    <div class="form-group">
		                        <textarea name="description" class="form-control" placeholder="Enter description" rows="3" required></textarea>
		                    </div>
		                    <input type="hidden" name="columnId" value="${data.id}" />
		                    <button type="submit" class="btn btn-primary">Save</button>
		                    <button type="button" class="btn btn-secondary" data-toggle="collapse" data-target="#collapse${data.id}">Cancel</button>
		                </form>
		              </div>
		            </div>
		        </div>
		    </div>
		</div>
	`;

	return column_html;
}

// Create and return HTML template for a card
function createCard(data) {
	const card_html = `
		<div class="card bg-light mb-1" id="card-${data.id}" draggable="true" ondragstart="dragStart(event)">
            <div class="card-body">
                <h5 class="card-title">${data.title}</h5>
                <p class="card-text">${data.description}</p>
                <a href="#" class="card-link edit-card" data-columnid="${data.columnId}" data-id="${data.id}" data-title="${data.title}" data-description="${data.description}"><i class="far fa-edit"></i></a>
                <a href="#" class="card-link" onClick="deleteCard(${data.id})"><i class="far fa-trash-alt"></i></a>
            </div>
        </div>
	`;

	return card_html;
}

/*
*********************
CARDS
*********************
 */

// Delete a card
function deleteCard(id) {
	var result = confirm("Are you sure you want to delete");
	if (result) {
	    let fetchData = { 
		    method: 'DELETE',
		    headers: new Headers()
		}

		// submit delete card id to API
		fetch(apiURL + "cards/"+id, fetchData)
			.then(function(result) {
				location.reload();
			});
	}
}

// Add a new card
$(document).on("submit", ".card-form", function (e) {
	e.preventDefault();
	
	// build headers
	let form = $(this);
	let data = {};
	let fetchData = { 
	    method: 'POST', 
	    body: data,
	    headers: new Headers({
	    	'Content-Type':'application/json'
	    })
	}

	// get form values and bind to card object
	form.find('[name]').each(function(i, v){
		var input = $(this), // resolves to current input element.
			name = input.attr('name'),
			value = isNaN(input.val()) ? input.val() : parseInt(input.val(), 10);
		data[name] = value;
	});
	fetchData.body = JSON.stringify(data);

	// submit card details to API
	fetch(apiURL + "cards/", fetchData)
		.then(function(result) {
			location.reload();
		});
});

// Edit a existing card
$(document).on("click", ".edit-card", function (e) {
	// Load card data to form
	$("#editId").val($(this).data('id'));
	$("#editTitle").val($(this).data('title'));
	$("#editDescription").val($(this).data('description'));
	$("#editColumnId").val($(this).data('columnid'));

	// Display edit modal
	$('#editCardModal').modal('show');
});

// Update an existing card
$(document).on("submit", "#editForm", function (e) {
	e.preventDefault();

	// build headers
	let form = $(this);
	let data = {
		"title": $("#editTitle").val(),
		"description": $("#editDescription").val(),
		"columnId": parseInt($("#editColumnId").val(), 10)
	};
	let fetchData = { 
	    method: 'PUT', 
	    body: JSON.stringify(data),
	    headers: new Headers({
	    	'Content-Type':'application/json'
	    })
	}

	fetch(apiURL + "cards/" + $("#editId").val(), fetchData)
		.then(function(result) {
			location.reload();
		});
	
	// Dismiss modal
	$('#editCardModal').modal('hide');
});

/*
*********************
LISTS
*********************
 */

// Add a new list
$(document).on("submit", "#addColumnForm", function (e) {
	e.preventDefault();

	// build headers
	let form = $(this);
	let data = {
		"title": $("#addColumnTitle").val()
	};
	let fetchData = { 
	    method: 'POST', 
	    body: JSON.stringify(data),
	    headers: new Headers({
	    	'Content-Type':'application/json'
	    })
	}

	fetch(apiURL + "columns/", fetchData)
		.then(function(result) {
			location.reload();
		});
	
	// Dismiss modal
	$('#addColumnModal').modal('hide');
});

// Delete a list
function deleteList(id) {
	var result = confirm("Are you sure you want to delete?");
	if (result) {
	    let fetchData = { 
		    method: 'DELETE',
		    headers: new Headers()
		}

		// submit delete card id to API
		fetch(apiURL + "columns/"+id, fetchData)
			.then(function(result) {
				location.reload();
			});
	}
}

// Clear add list modal, on hidden
$('#addColumnModal').on('hidden.bs.modal', function (e) {
	$("#editColumnTitle").val("");
})

// Edit a existing list
$(document).on("click", ".edit-list", function (e) {
	// Load card data to form
	$("#editListId").val($(this).data('id'));
	$("#editListTitle").val($(this).data('title'));

	// Display edit modal
	$('#editListModal').modal('show');
});

// Update an existing list
$(document).on("submit", "#editListForm", function (e) {
	e.preventDefault();

	// build headers
	let form = $(this);
	let data = {
		"title": $("#editListTitle").val(),
	};
	let fetchData = { 
	    method: 'PUT', 
	    body: JSON.stringify(data),
	    headers: new Headers({
	    	'Content-Type':'application/json'
	    })
	}

	fetch(apiURL + "columns/" + $("#editListId").val(), fetchData)
		.then(function(result) {
			location.reload();
		});
	
	// Dismiss modal
	$('#editListModal').modal('hide');
});

/*
*********************
SEARCH
*********************
 */

// Search through cards
$(document).on("click", "#searchBtn", function (e) {
	if($("#search").val().length == 0) {
		alert("Please enter a valid search string");
	} else {
		loadBoardData($("#search").val());
	}
});