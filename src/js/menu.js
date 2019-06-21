const Ramble = require('./Ramble.js');
const MessageComponent = require('./component/MessageComponent.js');

const ramble = new Ramble();
const messages = new MessageComponent();

const list = $('.menu-conversations');
const defaultConversation = $('.conversation.default');
const addButton = $('.conversation-add');
const conversationForm = $('#conversation-form');

const addToList = (name) => {
  const record = defaultConversation.clone(true);
  record.data('name', name);
  record.find('.name').text(name);
  record.removeClass('default');
  list.append(record);
};

ramble.conversations.list().then((result) => {
  result.forEach((conversation) => {
    const data = conversation;
    addToList(data.name);
  });
});

$('.conversation').dblclick(() => {
  window.location.href = `./index.html?${$(this).data('name')}`;
});


// Initialize dialog.
const conversationDialogBox = $('#conversation-dialog');
$(() => {
  conversationDialogBox.dialog({
    autoOpen: false,
  });
});

addButton.click((e) => {
  e.preventDefault();
  conversationDialogBox.dialog('open');
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
    .then(() => {
      addToList(data.name);
      conversationDialogBox.dialog('close');
      form.trigger('reset');
    });
});
