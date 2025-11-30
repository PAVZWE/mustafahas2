// **المفتاح السري لقاعدة بياناتك المحلية (Local Storage Key)**
const DB_KEY = 'mySmartLocalSiteData';

// **!! تم تحديث هذا الرابط ليطابق رابط موقعك على GitHub Pages !!**
const DUMMY_BASE_URL = 'https://github.com/PAVZWE/mustafahas2/blob/main/index.html'; 

// **بيانات أولية (تظهر فقط عند تشغيل التطبيق لأول مرة)**
const initialPosts = [
    {
        id: 1,
        imagePath: 'images/first_post_image.jpg',
        caption: "مرحباً بكم في أول منشور لي! أتمنى لكم يوماً سعيداً.",
        likes: 0, 
        comments: [] 
    },
    {
        id: 2,
        imagePath: 'images/second_post_image.png',
        caption: "صورة جديدة لغروب الشمس، ما أجمل المنظر! ✨",
        likes: 0, 
        comments: []
    }
];

// -----------------------------------------------------------------
// **دوال التعامل مع Local Storage (قاعدة البيانات المحلية)**
// -----------------------------------------------------------------

function getLocalData() {
    const storedData = localStorage.getItem(DB_KEY);
    if (storedData) {
        return JSON.parse(storedData);
    }
    saveLocalData(initialPosts);
    return initialPosts;
}

function saveLocalData(posts) {
    localStorage.setItem(DB_KEY, JSON.stringify(posts));
}

function clearLocalData() {
    if (confirm("هل أنت متأكد من مسح جميع البيانات؟")) {
        localStorage.removeItem(DB_KEY);
        location.reload(); 
    }
}

// -----------------------------------------------------------------
// **دوال التفاعل**
// -----------------------------------------------------------------

function toggleLike(postId) {
    const posts = getLocalData();
    const postIndex = posts.findIndex(p => p.id === postId);

    if (postIndex !== -1) {
        posts[postIndex].likes += 1; 
        saveLocalData(posts); 
        renderPosts();
        hideShareOutput(); 
    }
}

function addComment(postId, commentText) {
    const posts = getLocalData();
    const postIndex = posts.findIndex(p => p.id === postId);

    if (postIndex !== -1 && commentText.trim() !== "") {
        const newComment = {
            user: "أنا (المستخدم المحلي)", 
            text: commentText
        };
        posts[postIndex].comments.push(newComment);
        saveLocalData(posts); 
        renderPosts();
        hideShareOutput(); 
    }
}

function addNewPost() {
    const imagePath = document.getElementById('new-image-path').value.trim();
    const caption = document.getElementById('new-caption').value.trim();

    if (!imagePath || !caption) {
        alert("الرجاء إدخال مسار الصورة والوصف.");
        return;
    }

    const posts = getLocalData();
    const newId = posts.length > 0 ? Math.max(...posts.map(p => p.id)) + 1 : 1;

    const newPost = {
        id: newId,
        imagePath: imagePath,
        caption: caption,
        likes: 0,
        comments: []
    };

    posts.push(newPost);
    saveLocalData(posts);
    renderPosts();

    hideAddPostForm();
    document.getElementById('new-image-path').value = '';
    document.getElementById('new-caption').value = '';
    hideShareOutput();
}


// -----------------------------------------------------------------
// **دوال المشاركة والتشفير مع الضوء الأخضر/الأحمر**
// -----------------------------------------------------------------

/**
 * دالة لعرض حالة العملية (الضوء).
 */
function setStatusLight(isSuccess, message) {
    const light = document.getElementById('status-light');
    light.textContent = message;
    light.style.display = 'block';

    light.className = '';
    if (isSuccess) {
        light.classList.add('light-success');
    } else {
        light.classList.add('light-failure');
    }
}

/**
 * دالة لتشفير البيانات الحالية وتوليد رابط المشاركة.
 */
function createShareableLink() {
    try {
        const posts = getLocalData();
        const dataString = JSON.stringify(posts);
        const encodedData = btoa(dataString); // تشفير Base64

        if (encodedData.length > 10) { 
            // **استخدام الرابط الحقيقي المحدث**
            const shareLink = DUMMY_BASE_URL + '?data=' + encodedData;

            const outputDiv = document.getElementById('share-output');
            const textArea = document.getElementById('share-link-area');

            textArea.value = shareLink;
            outputDiv.style.display = 'block';
            textArea.select();
            
            // **تشغيل الضوء الأخضر**
            setStatusLight(true, '✅ نجحت العملية! الرابط المشفر جاهز للنسخ.');
            
        } else {
            // **تشغيل الضوء الأحمر**
            setStatusLight(false, '❌ فشلت العملية. قد تكون البيانات فارغة.');
            hideShareOutput();
        }

    } catch (error) {
        setStatusLight(false, `❌ خطأ في التشفير: ${error.message}`);
        hideShareOutput();
    }
}


/**
 * دالة لقراءة البيانات من الرابط (عند فتح الرابط المشترك).
 */
function loadDataFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    const encodedData = urlParams.get('data');

    if (encodedData) {
        try {
            const dataString = atob(encodedData); 
            const sharedPosts = JSON.parse(dataString);
            
            saveLocalData(sharedPosts);
            
            alert('🎉 تم تحميل بيانات اللايكات والتعليقات المشتركة بنجاح!');
            
            window.history.replaceState({}, document.title, window.location.pathname); 

        } catch (e) {
            console.error("❌ خطأ في قراءة البيانات المشتركة من الرابط:", e);
        }
    }
}

// -----------------------------------------------------------------
// **دوال عرض وإخفاء النماذج**
// -----------------------------------------------------------------

function showAddPostForm() {
    document.getElementById('add-post-form').style.display = 'block';
    hideShareOutput();
}

function hideAddPostForm() {
    document.getElementById('add-post-form').style.display = 'none';
}

function hideShareOutput() {
    const outputDiv = document.getElementById('share-output');
    if (outputDiv) {
        outputDiv.style.display = 'none';
    }
    const light = document.getElementById('status-light');
    if (light) {
        light.style.display = 'none';
    }
}

// -----------------------------------------------------------------
// **دالة عرض المنشورات على الصفحة (Render)**
// -----------------------------------------------------------------

function renderPosts() {
    const posts = getLocalData();
    const container = document.getElementById('posts-container');
    container.innerHTML = ''; 

    posts.forEach(post => {
        const postElement = document.createElement('div');
        postElement.className = 'post';

        // الصورة والوصف واللايكات
        postElement.innerHTML = `
            <img src="${post.imagePath}" alt="${post.caption}">
            <p class="caption">${post.caption}</p>
            <p><strong>الإعجابات: ${post.likes}</strong></p>
        `;

        // زر الإعجاب
        const likeButton = document.createElement('button');
        likeButton.className = 'like-button';
        likeButton.textContent = `أعجبني (${post.likes})`;
        likeButton.onclick = () => toggleLike(post.id);
        postElement.appendChild(likeButton);

        // عرض التعليقات
        const commentsList = document.createElement('ul');
        commentsList.className = 'comment-list';
        if (post.comments.length === 0) {
            const li = document.createElement('li');
            li.textContent = "لا توجد تعليقات بعد. كن أول من يعلق!";
            commentsList.appendChild(li);
        } else {
            post.comments.forEach(comment => {
                const li = document.createElement('li');
                li.innerHTML = `<strong>${comment.user}</strong>: ${comment.text}`;
                commentsList.appendChild(li);
            });
        }
        postElement.appendChild(commentsList);

        // نموذج إضافة تعليق
        const commentArea = document.createElement('div');
        commentArea.innerHTML = `
            <input type="text" id="comment-input-${post.id}" class="comment-input" placeholder="اكتب تعليقك...">
            <button class="comment-button" onclick="handleCommentSubmission(${post.id})">إرسال</button>
        `;
        postElement.appendChild(commentArea);

        container.appendChild(postElement);
    });
}

// دالة مساعدة لجلب النص من حقل الإدخال وإرساله لدالة addComment
function handleCommentSubmission(postId) {
    const inputElement = document.getElementById(`comment-input-${postId}`);
    const commentText = inputElement.value;
    addComment(postId, commentText);
    inputElement.value = '';
}


// -----------------------------------------------------------------
// **نقطة البداية لتشغيل التطبيق:**
// -----------------------------------------------------------------
loadDataFromURL(); 
renderPosts();
