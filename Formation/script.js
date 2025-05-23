document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('register-button').addEventListener('click', registerImage);
    loadImages();
});

function registerImage() {
    const url = document.getElementById('image-url').value;
    const name = document.getElementById('image-name').value;
    if (url && name) {
        const images9 = getImages();
        const newZIndex = images9.length + 1;
        images9.unshift({ url, name, x: 0, y: 0, zIndex: newZIndex });
        saveImages(images); //ココでローカルストレージの名前を変える
        loadImages();
        document.getElementById('image-url').value = '';
        document.getElementById('image-name').value = '';
    } else {
        alert('URLと名前を入力してください。');
    }
}



function loadImages() {
    const images9 = getImages();
    const list = document.getElementById('image-list');
    const area = document.getElementById('drag-area');
    list.innerHTML = '';
    area.innerHTML = '';

    images9.forEach((image, index) => {
        const listItem = document.createElement('div');
        listItem.className = 'image-entry';
        listItem.innerHTML = `
            <img src="${image.url}" alt="${image.name}">
            <span class="name">${image.name}</span>
            <span class="delete-btn" onclick="deleteImage(${index})">削除</span>
        `;
        list.appendChild(listItem);

        const imageContainer = document.createElement('div');
        imageContainer.className = 'image-container';
        imageContainer.style.position = 'absolute';
        imageContainer.style.left = image.x + 'px';
        imageContainer.style.top = image.y + 'px';
        imageContainer.style.zIndex = image.zIndex;

        const imageElement = document.createElement('img');
        imageElement.src = image.url;
        imageElement.className = 'draggable-image';
        imageElement.style.zIndex = image.zIndex;

        const nameTag = document.createElement('div');
        nameTag.textContent = image.name;
        nameTag.className = 'name-tag';
        nameTag.style.zIndex = image.zIndex;

        imageContainer.appendChild(imageElement);
        imageContainer.appendChild(nameTag);

        addDragFunctionality(imageContainer, index);

        area.appendChild(imageContainer);
        updateListLayout(listItem, index);
    });
}


function addDragFunctionality(container, index) {
    container.addEventListener('mousedown', function(e) {
        const dragAreaBounds = document.getElementById('drag-area').getBoundingClientRect();
        const offsetX = e.clientX - container.getBoundingClientRect().left;
        const offsetY = e.clientY - container.getBoundingClientRect().top;

        function onMouseMove(e) {
            let newX = e.clientX - dragAreaBounds.left - offsetX;
            let newY = e.clientY - dragAreaBounds.top - offsetY;

            newX = Math.max(0, Math.min(newX, dragAreaBounds.width - container.offsetWidth));
            newY = Math.max(0, Math.min(newY, dragAreaBounds.height - container.offsetHeight));

            container.style.left = newX + 'px';
            container.style.top = newY + 'px';
        }

        function onMouseUp() {
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);

            const images9 = getImages();
            images9[index].x = parseInt(container.style.left, 10);
            images9[index].y = parseInt(container.style.top, 10);
            saveImages(images9);
        }

        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    });

    container.ondragstart = function() {
        return false;
    };
}


function deleteImage(index) {
    const images9 = getImages();
    images9.splice(index, 1);
    saveImages(images9);
    loadImages();
}

function getImages() {
    return JSON.parse(localStorage.getItem('images9') || '[]');
}

function saveImages(images9) {
    localStorage.setItem('images9', JSON.stringify(images9));
}

function addListDragFunctionality(element, index) {
    element.draggable = true;
    element.addEventListener('dragstart', function(e) {
        e.dataTransfer.setData('text/plain', index);
    });

    element.addEventListener('dragover', function(e) {
        e.preventDefault();
    });

    element.addEventListener('drop', function(e) {
        e.preventDefault();
        const oldIndex = e.dataTransfer.getData('text/plain');
        const newIndex = [...element.parentNode.children].indexOf(element);
        moveImageInList(oldIndex, newIndex);
    });
}


function moveImageInList(oldIndex, newIndex) {
    const images9 = getImages();
    if (oldIndex !== newIndex) {
        const movedItem = images9.splice(oldIndex, 1)[0];
        images9.splice(newIndex, 0, movedItem);
        
        images9.forEach((img, idx) => img.zIndex = images9.length - idx);
        
        saveImages(images9);
        loadImages();
    }
}




function updateListLayout(listItem, index) {
    const img = listItem.querySelector('img');
    const name = listItem.querySelector('.name');
    const btn = listItem.querySelector('.delete-btn');

    const flexContainer = document.createElement('div');
    flexContainer.style.display = 'flex';
    flexContainer.style.alignItems = 'center';
    flexContainer.style.justifyContent = 'space-between';

    flexContainer.appendChild(img);
    flexContainer.appendChild(name);
    flexContainer.appendChild(btn);

    listItem.innerHTML = '';
    listItem.appendChild(flexContainer);
    addListDragFunctionality(listItem, index);
}

function addNameBelowImage(imageElement, name, index) {
    const nameTag = document.createElement('div');
    nameTag.classList.add('name-tag');
    nameTag.textContent = name;
    nameTag.style.position = 'absolute';
    updateNameTagPosition(imageElement, index);

    document.getElementById('drag-area').appendChild(nameTag);
}

function updateNameTagPosition(imageElement, index) {
    const nameTags = document.getElementsByClassName('name-tag');
    if (nameTags[index]) {
        nameTags[index].style.left = imageElement.style.left;
        nameTags[index].style.top = `calc(${imageElement.style.top} + ${imageElement.offsetHeight}px)`;
        nameTags[index].style.backgroundColor = 'rgba(255, 255, 255, 0.7)';
        nameTags[index].style.padding = '2px';
    }
}