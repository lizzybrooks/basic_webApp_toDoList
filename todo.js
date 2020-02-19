/**
 * File: todo.js
 * -------------
 * Provides the necessary Javascript needed to wire up the
 * event handling necessary for my ToDo list to properly operate.
 * The implementation assumed server-side the following server-side
 * endpoints:
 *
 *   + /scripts/getListsItems.py
 *   + /scripts/addListItem.py
 *   + /scripts/removeListItems.py
 *
 * The initial web page is empty, but immediately populated
 * the information based on what's returned by an onload call
 * to /scripts/getListsItems.py.  New items are added to the
 * UI on enter or add-click, but only after the new item has been
 * shared with the server and confirmed to be stored.  Similarly,
 * whenever a user deletes one or all items, the UI is only
 * updated after the server has been updated to reflect the deletions.
 */
"use strict";

/*
 * Function: BootstrapToDoList
 * ---------------------------
 * The following code block is executed once the
 * entire HTML file has been parsed and the DOM
 * has been fully constructed to represent it.  
 * Then, and only then, are we permitted to
 * search for elements by their ID
 */
function BootstrapToDoList() {

   /* Persistent variables accessed by the inner callback functions */
   let ul = document.getElementById("to-do-list");
   let addButton = document.getElementById("add-item");
   let clearButton = document.getElementById("clear-all-items");
   let input = document.getElementById("item-text");

   /**
    * Function: onAddClick
    * --------------------
    * Invoked whenever the user clicks the Add button.
    * Whatever text resides in the one text input field
    * is extracted, and if its nonempty, a new todo list
    * entry is appended to the existing list by creating
    * a new li element and appending it to the list
    * of children already hanging from the <ul> element.
    *
    * Note that we are careful to add a text element as the
    * lone child, and we also add the correct double click
    * listener to the li item, just as we did for those that
    * existed at the time of the page load.
    */
   function onAddClick(e) { // e argument is ignored
      let text = input.value.trim();
      input.value = "";
      if (text.trim() == 0) return;
      
      AsyncRequest("/scripts/addListItem.py")
        .setMethod("POST")
        .setPayload(JSON.stringify(text))
        .setSuccessHandler(addNewListItem)
        .send();
   }

   /**
    * Function: onClearClick
    * ----------------------
    * Fired whenever the clear button is clicked.  The function
    * repeatedly removes the last child from the relevant <ul>
    * element until all of its children are gone.  Ironically,
    * there is no removeAllChildren method.
    */
   function onClearClick(e) { // e argument is ignored
      let itemIDs = [];
      for (let i = 0; i < ul.childNodes.length; i++) {
         itemIDs.push(ul.childNodes[i].getAttribute("data-id"));
      }
      
      AsyncRequest("/scripts/removeListItems.py")
         .setPayload(JSON.stringify(itemIDs))
         .setMethod("POST")
         .setSuccessHandler(removeListItems)
         .send();
   }

   /*
    * Function: onItemDoubleClick
    * ---------------------------
    * Fired whenever a list item (i.e. an <li> element is
    * double-clicked). The event object carries a target
    * attribute whose value is the element that triggered
    * the event.  We only add dblclick listeners to <li> 
    * elements (the original ones in the HTML file, and the
    * ones that are programmatically added).
    *
    * Fortunately, every single DOM node tracks its
    * parent, so the element that triggered the event
    * can asked the parent to remove it from its list
    * of children.
    */
   function onItemDoubleClick(e) {
      AsyncRequest("/scripts/removeListItems.py")
         .setMethod("POST")
         .setPayload(JSON.stringify([e.target.getAttribute("data-id")]))
         .setSuccessHandler(removeListItems)
         .send();
   }

   /**
    * Function: onKeyDown
    * -------------------
    * Triggered every single time the user presses
    * a key on the keyboard while the text input has
    * the focus.  All but one of the keys are irrelevant, 
    * but if the user presses the enter/return key, then
    * that's identified as an effort to effectively click
    * the add button.  And as it turns out, we reframe 
    * that very situation as an add button click: we call
    * the click method on the add button, which simulates
    * a button click as if we'd clicked it ourselves.
    */
   function onKeyDown(e) {
      if (e.which === undefined) e.which = e.keyCode;
      const ENTER_KEY = 13;
      if (e.which !== ENTER_KEY) return;
      addButton.click();
   }

   /* bind all interactors with relevant callbacks */

   clearButton.addEventListener("click", onClearClick);
   addButton.addEventListener("click", onAddClick);
   input.addEventListener("keydown", onKeyDown);
   
   AsyncRequest("/scripts/getListItems.py")
      .setSuccessHandler(populateInitialList)
      .send();
      
   /* Defined below are all of the helper functions and success handlers */     
   /* 
    * Function: appendListItem
    * ------------------------
    * Creates a new <li> node for the provided id/item pair.
    * The itemid is a numeric string (e.g. "54") which contributes
    * to the DOM is (e.g. "item-54") and also to a second attribute
    * called "data-id", which is just the "54".  I rely on both,
    * because I want a DOM id for quick lookup, but I don't want
    * it to be a number, because that feels weird.  I also want
    * a data attribute so I can easily extract the number for AsyncRequest
    * purposes, since POST requests can be used to permanently remove items
    * from the backend.
    *
    * Note that I also attach a double-click handler to each <li> so that
    * double clicking permanently removes the item from the server side.
    */
   function appendListItem(itemid, text) {
      let li = document.createElement("li");
      let tn = document.createTextNode(text);
      li.setAttribute("id", "item-" + itemid)
      li.setAttribute("data-id", itemid);
      li.addEventListener("dblclick", onItemDoubleClick);
      li.appendChild(tn);
      ul.appendChild(li);
   }
   
   /**
    * Function: populateInitialList
    * -----------------------------
    * This is installed as the success handler for GET
    * calls to /scripts/fetchListItems.py.
    * 
    * Clears the <ul> tag before populating it with
    * the series of list items embedded within the
    * response payload.  The structure of the
    * payload, once JSON.parse has been called, is
    * 
    * {
    *    "45": "Wash car.",
    *    "47": "Photocopy completed exams and post PDFs of solutions.",
    *    "48": "Cancel dinner reservations for Thursday."
    * }
    */
   function populateInitialList(response) {
      clearAllChildren(ul);
      let items = JSON.parse(response.getPayload());
      for (let key in items) {
         appendListItem(key, items[key]);
      }
   }
   
   /*
    * Function: addNewListItem
    * ------------------------
    * Similar to populateInitialList, except that we expect
    * the payload to only include one item id and one to-do list
    * item, structured as:
    *
    * {
    *    id: "49",
    *    item: "Confirm doggy day care for Doris."
    * }
    */
   function addNewListItem(response) {
      let payload = JSON.parse(response.getPayload());
      appendListItem(payload.id, payload.item);
   }
   
   /*
    * Function: removeListItems
    * -------------------------
    * This is installed as the success handler for GET
    * calls to /scripts/removeListItems.py.
    * 
    * The response is a JSON-encoded aggregate of all
    * the items to be deleted as keys, each mapped to
    * true or false, depending on whether they were
    * deleted or not.  For each item that was deleted,
    * we removed the corresponding <li> node from the list.
    */
   function removeListItems(response) {
      let itemsToDelete = JSON.parse(response.getPayload());
      for (let key in itemsToDelete) {
         if (itemsToDelete[key]) {
            let li = document.getElementById("item-" + key);
            li.parentNode.removeChild(li);
         }
      }
   }

   /*
    * Function: clearAllChildren
    * --------------------------
    * Depletes the childNodes array of the provided element.
    */
   function clearAllChildren(elem) {
      while (elem.lastChild !== null) {
         elem.removeChild(elem.lastChild);
      }
   }
}

/* Register the above function to execute when the DOM is fully loaded. */
document.addEventListener("DOMContentLoaded", BootstrapToDoList);