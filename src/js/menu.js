const Ramble = require('./Ramble.js');
const MessageComponent = require('./component/MessageComponent.js');

const ramble = new Ramble();
const messages = new MessageComponent();

const list = $('.menu-conversations');
const defaultConversation = $('.conversation.default');
const conversationForm = $('#conversation-form');

const addButton = $('.conversation-add');
const deleteButton = $('.conversation-delete');
const viewButton = $('.conversation-view');
const downloadButton = $('.conversation-download');

const addToList = (data) => {
  const record = defaultConversation.clone(true);
  record.removeClass('default');
  record.attr('data-name', data.name);
  record.attr('data-id', data._id);
  record.find('.name').text(data.name);
  list.append(record);
};

const removeFromList = (id) => {
  const record = $(`.conversation[data-id='${id}']`);
  record.remove();
};

ramble.conversations.list().then((result) => {
  result.forEach((conversation) => {
    const data = conversation;
    addToList(data);
  });
});

const redirectToGraph = (conversationName) => {
  window.location.href = `./index.html?conversation=${conversationName}`;
};

$('.conversation').dblclick(function redirect() {
  redirectToGraph($(this).data('name'));
});


// Initialize dialog.
const conversationDialogBox = $('#conversation-dialog');
$(() => {
  conversationDialogBox.dialog({
    autoOpen: false,
    resizable: false,
    modal: true,
    draggable: false,
  });
});

addButton.click((e) => {
  e.preventDefault();
  conversationDialogBox.dialog('open');
});

deleteButton.click(function removeConversation() {
  const id = $(this).closest('.conversation').attr('data-id');
  ramble.conversations.remove(id).then(() => {
    removeFromList(id);
  });
});

viewButton.click(function redirect() {
  redirectToGraph($(this).closest('.conversation').attr('data-name'));
});

downloadButton.click(function download() {
  ramble.export($(this).closest('.conversation').attr('data-name'));
});

const validateInput = (input) => {
  if ($(input).hasClass('not-empty') && !$(input).val()) {
    messages.error("Can't be empty.");
    $(input).addClass('validate-error');
    setTimeout(() => {
      $(input).removeClass('validate-error');
    }, 2000);
    return false;
  }
  return true;
};

const validateForm = (form) => {
  const inputs = form.find('input, textarea');

  let valid = true;
  $.each(inputs, (i, input) => {
    valid = valid && validateInput(input);
  });
  return valid;
};

const getDataFromForm = form => form.serializeArray().reduce((obj, item) => {
  const result = obj;
  result[item.name] = item.value;
  return result;
}, {});

const generateConversation = name => new Promise((resolve) => {
  const data = { name };
  ramble.conversations.add(data).then((result) => {
    resolve(result);
  });
});

conversationForm.submit((e) => {
  e.preventDefault();

  const form = $(e.currentTarget);
  const data = getDataFromForm(form);

  if (!validateForm(form)) {
    return;
  }
  // Add
  delete data.id;
  generateConversation(data.name)
    .then((result) => {
      addToList(result);
      conversationDialogBox.dialog('close');
      form.trigger('reset');
    });
});
