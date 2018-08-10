const DataController = (function () {
  const data = {
    items: [],
    current: null,
    totalCals: 0
  };
  return {
    getItems: () => {
      return data.items;
    },
    getCals: () => {
      return data.totalCals;
    },
    setCals: (cals) => {
      data.totalCals += cals;
    },
    setItem: (meal, cals) => {
      let id;
      if(data.items.length === 0) {
        id = 1;
      } else {
        id = data.items[data.items.length - 1].id + 1;
      }
      
      data.items.push({id, meal, cals});
      return id;
    },
    updateItem: (meal, cals) => {
      data.items.forEach((item) => {
        if(item.id === data.current) {
          item.meal = meal;
          item.cals = cals;
        }
      });
      data.totalCals = data.items.reduce((acc, cur) => acc + cur.cals, 0);
      data.current = null;
    },
    deleteItem: () => {
      let index = data.items.findIndex(cur => cur.id === data.current);
      data.items.splice(index, 1);
      data.totalCals = data.items.reduce((acc, cur) => acc + cur.cals, 0);
      data.current = null;
    },
    setCurrent: (id) => {
      data.current = id;
    },
    removeCurrent: () => {
      data.current = null;
    },
    getCurrent: () => {
      return data.current
    },
    clearAll: () => {
      while(data.items.length) {
        data.items.pop();
      }
      data.totalCals = 0;
    },
    init: (storage) => {
      console.log('In Data init');
      if(storage.length) {
        data.items = [...storage];
        data.items.forEach((item) => {
          data.totalCals += item.cals;
        });
        data.current = null;
      }
    }
  };
})();

const UIController = (function () {
  const selectors = {
    itemInput: document.querySelector('#meal'),
    calInput: document.querySelector('#calories'),
    addBtn: document.querySelector('#add-item'),
    clearBtn: document.querySelector('#clear-all'),
    updateBtn: document.querySelector('#update-item'),
    deleteBtn: document.querySelector('#delete-item'),
    backBtn: document.querySelector('#back'),
    itemContainer: document.querySelector('.item-container'),
    totalCals: document.querySelector('#total-cals span')
  };
  
  return {
    getSelectors: () => {
      return selectors;
    },
    createNewMeal: (meal, cal, id, total) => {
      const li = document.createElement('li');
      li.className = 'item';
      li.id = id;
      li.innerHTML = `
      <strong>${meal}</strong>
      <em>${cal}</em>
      <strong class='edit'>Edit</strong>
      `;
      selectors.itemContainer.appendChild(li);
      selectors.totalCals.textContent = total;
      selectors.itemInput.value = '';
      selectors.calInput.value = '';
    },
    updateItem: (child, meal, cal) => {
      child.children[0].textContent = meal;
      child.children[1].textContent = cal;
    },
    showEditState: (parent) => {
      selectors.addBtn.style.display = 'none';
      selectors.updateBtn.style.display = 'inline-block';
      selectors.deleteBtn.style.display = 'inline-block';
      selectors.backBtn.style.display = 'inline-block';
      
      selectors.itemInput.value = parent.children[0].textContent;
      selectors.calInput.value = parent.children[1].textContent;
    },
    hideEditState: () => {
      selectors.addBtn.style.display = 'inline-block';
      selectors.updateBtn.style.display = 'none';
      selectors.deleteBtn.style.display = 'none';
      selectors.backBtn.style.display = 'none';
      
      selectors.itemInput.value = '';
      selectors.calInput.value = '';
    },
    clearAll: () => {
      selectors.itemContainer.querySelectorAll('.item').forEach(item => {
        item.remove();
      });
      selectors.totalCals.textContent = 0;
    },
    init: (data) => {
      console.log('In UI init');
      let output = '';
      let total = 0;
      if (data.length) {
        data.forEach((item) => {
          output += `<li class='item' id='${item.id}'>
          <strong>${item.meal}</strong>
          <em>${item.cals}</em>
          <strong class='edit'>Edit</strong>
          </li>`;
          total += item.cals;
        });
        selectors.itemContainer.innerHTML = output;
        selectors.totalCals.textContent = total;
      }
    }
  };
})();

const StorageCtrl = (function () {
  
  return {
    add: (items) => {
      localStorage.setItem('data', JSON.stringify(items));      
    },
    clear: () => {
      localStorage.clear();
    },
    get: () => {
      let data;
      if(localStorage.getItem('data') === null) {
        data = [];
      } else {
        data = JSON.parse(localStorage.getItem('data'));
      }
      
      return data;
    }
  }
})();

const AppController = (function (UIController, DataController, StorageCtrl) {
  const selectors = UIController.getSelectors();
  
  const eventListeners = () => {
    selectors.addBtn.addEventListener('click', () => {
      let meal = selectors.itemInput.value;
      let cals = parseInt(selectors.calInput.value);
      if (meal !== '' && !isNaN(cals)) {
        let id = DataController.setItem(meal, cals);
        DataController.setCals(cals);
        UIController.createNewMeal(meal, cals, id, DataController.getCals());
        StorageCtrl.add(DataController.getItems());
      }
    });
    
    selectors.clearBtn.addEventListener('click', () => {
      UIController.clearAll();
      DataController.clearAll();
      StorageCtrl.clear();
    });
    
    selectors.itemContainer.addEventListener('click', (e) => {
      if (e.target.classList.contains('edit')) {
        DataController.setCurrent(parseInt(e.target.parentNode.id));
        UIController.showEditState(e.target.parentNode);
      }
    });
    
    selectors.backBtn.addEventListener('click', () => {
      UIController.hideEditState();
      DataController.removeCurrent();
    });
    
    selectors.updateBtn.addEventListener('click', () => {
      let children = selectors.itemContainer.children;
      let meal = selectors.itemInput.value;
      let cals = parseInt(selectors.calInput.value);
      if (meal !== '' && !isNaN(cals)) {
        for(let i = 0; i < children.length; i++) {
          if(children[i].id == DataController.getCurrent()) {
            DataController.updateItem(meal, cals);
            UIController.updateItem(children[i], meal, cals);
            UIController.hideEditState();
            selectors.totalCals.textContent = DataController.getCals();
          }
        }
      }
      StorageCtrl.add(DataController.getItems());
    });
    
    selectors.deleteBtn.addEventListener('click', () => {
      let children = selectors.itemContainer.children;
      
      for(let i = 0; i < children.length; i++) {
        if(children[i].id == DataController.getCurrent()) {
          children[i].remove();
        }
      }
      UIController.hideEditState();
      DataController.deleteItem();
      StorageCtrl.add(DataController.getItems());
      selectors.totalCals.textContent = DataController.getCals();
    });
  };
  
  return {
    init: () => {    
      console.log(StorageCtrl.get());
      UIController.init(StorageCtrl.get());
      DataController.init(StorageCtrl.get());
      UIController.hideEditState();
      eventListeners();
    }
  };
})(UIController, DataController, StorageCtrl);

AppController.init();