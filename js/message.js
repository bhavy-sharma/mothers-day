(function () {
    const messageItemClass = 'message-item';
    const messageCreators = [
        () => ' ',
        () => ' ',
        messageData => 'Dear ' + (messageData.momName || 'Mom') + ',',
        () => "Happy Mother's Day! This day is for you.",
        messageData => 'On ' + (messageData.birthdate || 'my birthday') + ', you became my ' + (messageData.momName || 'Mom') + '.',
        messageData => 'From that day forward, I have loved spending time with you, learning from you, and ' + (messageData.faveThing || 'being') + ' with you.',
        () => 'I love you, Mom. ❤️',
    ];

    let currentMessageIndex = 3;
    let linkTimeout = null;

    function showMessages() {
		const urlParams = new URLSearchParams(window.location.search);
		const dataId = window.location.hash.replace('#', '');
		console.log("Reading from sessionStorage:", dataId);
		const storedData = localStorage.getItem(dataId);
		console.log("Stored data:", storedData);
        const messageData = storedData ? JSON.parse(storedData) : null;

        if (!messageData) {
            document.querySelector('.main').innerHTML = '<p>Message expired or not found. Please generate a new one.</p>';
            return;
        }

        const mainElem = document.querySelector('.main');

        // Apply background image
        if (messageData.useCustomImage && messageData.bgImage) {
        document.body.style.backgroundImage = `url(${messageData.bgImage})`;
        document.body.style.backgroundSize = 'cover';
        document.body.style.backgroundPosition = 'center';
        document.body.style.backgroundRepeat = 'no-repeat';
        document.body.style.backgroundAttachment = 'fixed';
        } else if (window.innerWidth <= 768) {
        document.body.style.backgroundImage = "url('images/bg-mobile.png')";
        document.body.style.backgroundSize = 'cover';
        document.body.style.backgroundPosition = 'center';
        document.body.style.backgroundRepeat = 'no-repeat';
        document.body.style.backgroundAttachment = 'fixed';
}

        // Render messages
        messageCreators.forEach(messageCreator => {
            const messageElem = createMessageItem(messageCreator(messageData));
           messageElem.style.opacity = 1; // Start hidden
            mainElem.appendChild(messageElem);
        });

        const allMessages = document.getElementsByClassName(messageItemClass);
        // if (allMessages.length > 0) {
        //     TweenLite.to(allMessages[0], 1, {opacity: 1}); // Animate first message
        // }

        // Event listeners
        const downArrow = document.getElementById('downArrowButton');
        if (downArrow) {
            downArrow.addEventListener('click', () => handleMoveToNextMessage('down'));
            downArrow.style.display = 'inline-block';
			// downArrow.style.alignContent = 'center';

        }

        document.addEventListener('keydown', e => {
            if (e.key === 'ArrowUp') {
                handleMoveToNextMessage('up');
            } else if (e.key === 'ArrowDown') {
                handleMoveToNextMessage('down');
            }
        });

        // Clear session storage
        if (dataId) {
            sessionStorage.removeItem(dataId);
        }
    }

    function createMessageItem(message) {
        const itemContainer = document.createElement('div');
        itemContainer.className = messageItemClass;

        const item = document.createElement('span');
        item.className = 'message-item-text';
        item.textContent = message;
        itemContainer.appendChild(item);

        return itemContainer;
    }

    function handleMoveToNextMessage(direction) {
	clearTimeout(linkTimeout);

	const messages = document.getElementsByClassName(messageItemClass);
	if (messages.length === 0) return;

	// Hide all messages first
	for (let i = 0; i < messages.length; i++) {
		TweenLite.to(messages[i], 0.5, { opacity: 0 });
	}

	// Update current index
	if (direction === 'up') {
		currentMessageIndex = Math.max(0, currentMessageIndex - 1);
	} else {
		currentMessageIndex = Math.min(messages.length - 1, currentMessageIndex + 1);
	}

	// Show current message
	TweenLite.to(messages[currentMessageIndex], 0.5, { opacity: 1 });

	// Scroll to current message
	TweenLite.to(
		document.querySelector('.main'),
		1.5,
		{
			scrollTo: { y: messages[currentMessageIndex].offsetTop, autoKill: false },
			ease: Power3.easeInOut,
		}
	);

	const downArrow = document.getElementById('downArrowButton');
	const indexLink = document.getElementById('indexLink');

	if (currentMessageIndex === messages.length - 1) {
		if (downArrow) downArrow.style.display = 'none';
		if (indexLink) {
			indexLink.style.display = 'inline-block';
			linkTimeout = setTimeout(() => {
				indexLink.style.opacity = 1;
			}, 2000);
		}
	} else {
		if (downArrow) downArrow.style.display = 'inline-block';
		if (indexLink) {
			indexLink.style.display = 'none';
			indexLink.style.opacity = 0;
		}
	}
}


    if (document.readyState !== 'loading') {
        showMessages();
    } else {
        document.addEventListener('DOMContentLoaded', showMessages);
    }
})();
