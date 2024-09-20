// Importa funções e objetos do SDK do Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-app.js";
import { getFirestore, collection, addDoc, doc,deleteDoc, getDocs, updateDoc, query, where, increment, setDoc } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-firestore.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-auth.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-storage.js";

// Configuração do Firebase com suas credenciais
const firebaseConfig = {
  apiKey: "AIzaSyAKK6eR2FCQZU0v-Qz6nRKzh1w4p01xlng",
  authDomain: "cidade-do-sol-15b2b.firebaseapp.com",
  databaseURL: "https://cidade-do-sol-15b2b-default-rtdb.firebaseio.com",
  projectId: "cidade-do-sol-15b2b",
  storageBucket: "cidade-do-sol-15b2b.appspot.com",
  messagingSenderId: "764589965192",
  appId: "1:764589965192:web:0c15d184fa634cd144043d"
};

// Inicializa o Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app); // Inicializa o auth após a inicialização do app
const db = getFirestore(app);
const storage = getStorage(app);

// Função para exibir alertas personalizados
function showAlert(message, type = 'error') {
  const alertDiv = document.createElement('div');
  alertDiv.className = `alert alert-${type}`;
  alertDiv.textContent = message;
  document.body.appendChild(alertDiv);

  // Remove o alerta após alguns segundos
  setTimeout(() => {
    alertDiv.remove();
  }, 5000);
}

// Adiciona o listener para o estado de autenticação
onAuthStateChanged(auth, (user) => {
  if (user) {
    console.log('Usuário está autenticado:', user);
    // Você pode redirecionar o usuário para uma página diferente, se necessário
    // window.location.href = 'pagina_inicial.html'; // Exemplo de redirecionamento
  } else {
    console.log('Nenhum usuário autenticado.');
    // Redirecionar para a página de login ou exibir mensagem
    // window.location.href = 'login.html'; // Exemplo de redirecionamento
  }
});

// Funções do Firebase
export async function testFirestore() {
  try {
    console.log('Testando conexão com Firestore...');
    const querySnapshot = await getDocs(collection(db, "testCollection")); // Testa acessando uma coleção fictícia
    if (!querySnapshot.empty) {
      console.log('Conexão com Firestore bem-sucedida.');
    }
    return true; // Retorna sucesso se conectar
  } catch (error) {
    console.error("Erro ao conectar ao Firestore:", error);
    throw error; // Lança o erro para ser capturado no app.js
  }
}

// Expondo funções no escopo global
window.likePost = async function(postId) {
  try {
    const postRef = doc(db, 'postagens', postId);
    await updateDoc(postRef, {
      likes: increment(1)
    });
    const likeCountElement = document.querySelector(`.like-count[data-post-id="${postId}"]`);
    if (likeCountElement) {
      likeCountElement.textContent = (parseInt(likeCountElement.textContent) + 1) + ' curtidas';
    }
    console.log('Postagem curtida com sucesso.');
  } catch (error) {
    console.error('Erro ao curtir postagem:', error.message);
    alert('Erro ao curtir postagem.');
  }
};

window.addComment = async function(postId) {
  const commentInput = document.getElementById(`comment-${postId}`);
  const comment = commentInput ? commentInput.value : '';

  if (comment.trim()) {
    const commentsRef = collection(db, 'postagens', postId, 'comments');
    await addDoc(commentsRef, {
      comment,
      createdAt: new Date()
    });
    commentInput.value = ''; // Limpa o campo de comentário após adicionar
    displayComments(postId); // Atualiza a lista de comentários
  }
};

async function displayComments(postId) {
  const commentsRef = collection(db, 'postagens', postId, 'comments');
  const querySnapshot = await getDocs(commentsRef);
  const commentsDiv = document.getElementById(`comments-${postId}`);
  
  if (commentsDiv) {
    commentsDiv.innerHTML = '';
    querySnapshot.forEach((doc) => {
      const commentData = doc.data();
      commentsDiv.innerHTML += `<p>${commentData.comment} - ${new Date(commentData.createdAt.seconds * 1000).toLocaleString()}</p>`;
    });
  }
}

export async function getUserData(uid) {
  try {
    const userDoc = await getDoc(doc(db, 'users', uid));
    return userDoc.exists() ? userDoc.data() : null;
  } catch (error) {
    console.error('Erro ao obter dados do usuário:', error.message);
    throw error;
  }
}

export async function updateUserDataA(uid, data) {
  try {
    await updateDoc(doc(db, 'users', uid), data);
    console.log('Dados do usuário atualizados com sucesso.');
  } catch (error) {
    console.error('Erro ao atualizar dados do usuário:', error.message);
    throw error;
  }
}

export async function getUserPosts(uid) {
  try {
    const postsQuerySnapshot = await getDocs(query(collection(db, 'postagens'), where('uid', '==', uid)));
    return postsQuerySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Erro ao buscar postagens do usuário:', error.message);
    throw error;
  }
}

export async function addMessage({ titulo, conteudo }) {
  try {
    if (!titulo || !conteudo || typeof titulo !== 'string' || typeof conteudo !== 'string') {
      throw new Error('Título e conteúdo devem ser strings não vazias.');
    }
    const docRef = await addDoc(collection(db, 'postagens'), {
      titulo: titulo,
      conteudo: conteudo,
      data: new Date()
    });
    console.log('Documento escrito com ID:', docRef.id);
    showAlert('Mensagem adicionada com sucesso!', 'success');
  } catch (error) {
    console.error('Erro ao adicionar documento:', error.message);
    showAlert('Erro ao adicionar documento: ' + error.message);
    throw error;
  }
}

export async function login(email, password) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    console.log('Usuário autenticado com email:', email);
    showAlert('Login realizado com sucesso!', 'success');
    return userCredential.user;
  } catch (error) {
    let errorMessage;
    if (error.code === 'auth/user-not-found') {
      errorMessage = 'Usuário não encontrado. Verifique o e-mail informado.';
    } else if (error.code === 'auth/wrong-password') {
      errorMessage = 'Senha incorreta. Verifique e tente novamente.';
    } else {
      errorMessage = 'Erro ao fazer login: ' + error.message;
    }
    console.error(errorMessage);
    showAlert(errorMessage);
    throw error;
  }
}

export async function logout() {
  try {
    await signOut(auth);
    console.log('Usuário deslogado com sucesso.');
    showAlert('Você foi desconectado com sucesso.', 'success');

    // Força uma atualização do estado de autenticação após logout
    onAuthStateChanged(auth, (user) => {
      if (!user) {
        console.log('Nenhum usuário autenticado após logout.');
        // Redirecionar para a página de login
        window.location.href = 'login.html'; // Exemplo de redirecionamento
      }
    });
  } catch (error) {
    console.error('Erro ao fazer logout:', error.message);
    showAlert('Erro ao fazer logout. Tente novamente.');
    throw error;
  }
}

export async function updateUserData(uid, data) {
  try {
    await setDoc(doc(db, 'users', uid), data); // Salva os dados do usuário no Firestore
    console.log('Dados do usuário salvos com sucesso.');
  } catch (error) {
    console.error('Erro ao salvar dados do usuário:', error);
    throw error;
  }
}

export async function register(email, password) {
  try {
    console.log('Tentando registrar usuário com email:', email);
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    console.log('Usuário registrado com email:', email);
    showAlert('Cadastro realizado com sucesso!', 'success');
    return userCredential.user;
  } catch (error) {
    let errorMessage;
    if (error.code === 'auth/email-already-in-use') {
      errorMessage = 'Este e-mail já está em uso. Tente um e-mail diferente.';
    } else if (error.code === 'auth/invalid-email') {
      errorMessage = 'E-mail inválido. Verifique e tente novamente.';
    } else if (error.code === 'auth/weak-password') {
      errorMessage = 'A senha deve ter pelo menos 6 caracteres.';
    } else {
      errorMessage = 'Erro ao registrar usuário: ' + error.message;
    }
    console.error(errorMessage);
    showAlert(errorMessage);
    throw error;
  }
}

// função onde mostra as postagens.
export async function displayPosts() {
  try {
    const auth = getAuth();

    // Verifica se o estado de autenticação mudou
    onAuthStateChanged(auth, async (user) => {
      const postsSection = document.getElementById('posts-section');
      if (!postsSection) return;

      postsSection.innerHTML = '';
      const querySnapshot = await getDocs(collection(db, 'postagens'));

      if (querySnapshot.empty) {
        postsSection.innerHTML = '<p>Nenhuma postagem encontrada.</p>';
        return;
      }

      // Verifica se estamos na página "minhas-postagens.html"
      const isMyPostsPage = window.location.pathname.includes('minhasPostagens.html');

      querySnapshot.forEach((doc) => {
        const postData = doc.data();
        const postId = doc.id;

        // Verifica se o usuário logado é o dono da postagem
        const isOwner = user && postData.uid === user.uid;

        // Logs para depuração
        console.log('Usuário logado:', user ? user.uid : 'Nenhum usuário');
        console.log('Dono da postagem:', postData.uid);

        // Na página "minhas-postagens.html", só exibe postagens do usuário logado
        if (isMyPostsPage && !isOwner) {
          return; // Ignora postagens que não pertencem ao usuário logado
        }

        const postElement = document.createElement('div');
        postElement.classList.add('post');

        postElement.innerHTML = `
          <h2 class="post-title">${postData.titulo}</h2>
          <p class="post-content">${postData.conteudo}</p>
          ${postData.imageUrl ? `<img src="${postData.imageUrl}" class="post-image">` : ''}
          <p class="post-date">${new Date(postData.data.seconds * 1000).toLocaleDateString()}</p>
          <div class="post-actions">
            ${isMyPostsPage && isOwner ? `
              <button class="btn btn-primary" onclick="editPost('${postId}', '${postData.titulo}', '${postData.conteudo}', '${postData.imageUrl || ''}')">Editar</button>
              <button class="btn btn-danger" onclick="deletePost('${postId}')">Excluir</button>
            ` : ''}
            <button class="btn btn-secondary" onclick="likePost('${postId}')">Curtir</button>
            <span class="like-count" data-post-id="${postId}">${postData.likes || 0} curtidas</span>
            <button class="btn btn-share" onclick="sharePost('${postId}')">Compartilhar</button>
          </div>
          <div class="comments-section">
            <input type="text" id="comment-${postId}" placeholder="Digite seu comentário">
            <button onclick="addComment('${postId}')">Comentar</button>
            <div id="comments-${postId}"></div>
          </div>
        `;

        postsSection.appendChild(postElement);
        displayComments(postId); // Carrega comentários para a postagem
      });

      console.log('Postagens carregadas com sucesso.');
    });
  } catch (error) {
    console.error('Erro ao buscar postagens:', error);
    alert('Erro ao buscar postagens.');
  }
}




// Chama as funções para testar e exibir as postagens quando a página for carregada
document.addEventListener('DOMContentLoaded', () => {
  displayPosts(); // Exibe as postagens
  testFirestore(); // Testa a conexão com o Firestore
});


// Compartilhar///
function sharePost(postId) {
  const postElement = document.querySelector(`.post[data-post-id="${postId}"]`);
  const postTitle = postElement.querySelector('.post-title').textContent;
  const postContent = postElement.querySelector('.post-content').textContent;
  const postUrl = window.location.href; // Ajuste isso conforme necessário para criar um URL de compartilhamento adequado

  if (navigator.share) {
    navigator.share({
      title: postTitle,
      text: postContent,
      url: postUrl
    })
    .then(() => console.log('Compartilhamento bem-sucedido'))
    .catch((error) => console.log('Erro ao compartilhar:', error));
  } else {
    // Fallback para navegadores que não suportam a API de compartilhamento
    alert('Compartilhamento não suportado neste navegador.');
  }
  
}
// Função para atualizar uma postagem

// Função para excluir uma postagem no Firestore
export async function deletePost(postId) {
  // Exibe um alerta de confirmação antes de excluir
  if (confirm('Tem certeza que deseja excluir esta postagem?')) {
    try {
      // Referência ao documento da postagem no Firestore
      const postRef = doc(db, 'postagens', postId);

      // Exclui o documento
      await deleteDoc(postRef);

      // Exibe uma mensagem de sucesso
      alert('Postagem excluída com sucesso.');

      // Recarrega as postagens na página
      displayPosts(); // Recarrega a lista de postagens

    } catch (error) {
      console.error('Erro ao excluir postagem:', error.message);
      alert('Erro ao excluir a postagem.');
    }
  }
}

 // Função para atualizar a postagem no Firestore
export async function updatePost(postId, updatedData) {
  try {
    const postRef = doc(db, 'postagens', postId);
    await updateDoc(postRef, updatedData);
    console.log('Postagem atualizada com sucesso.');
  } catch (error) {
    console.error('Erro ao atualizar postagem:', error.message);
    throw error;
  }
}
 
 

// Função para editar uma postagem
 // Função para abrir o modal de edição com os dados atuais da postagem
export function editPost(postId, currentTitle, currentContent, currentImageUrl) {
  const modal = document.getElementById('editPostModal');
  const editTitle = document.getElementById('editTitle');
  const editContent = document.getElementById('editContent');
  const editImageUrl = document.getElementById('editImageUrl');

  // Preenche o modal com os dados atuais da postagem
  editTitle.value = currentTitle;
  editContent.value = currentContent;
  editImageUrl.value = currentImageUrl;

  // Exibe o modal
  modal.style.display = 'block';

  // Quando o usuário clica em "Salvar"
  document.getElementById('savePostChanges').onclick = async function () {
    // Obter os novos valores do formulário
    const newTitle = editTitle.value;
    const newContent = editContent.value;
    const newImageUrl = editImageUrl.value;

    if (newTitle && newContent) {
      // Atualiza a postagem no Firestore
      try {
        await updatePost(postId, {
          titulo: newTitle,
          conteudo: newContent,
          imageUrl: newImageUrl || currentImageUrl
        });

        // Fecha o modal e recarrega as postagens
        modal.style.display = 'none';
        displayPosts();
      } catch (error) {
        console.error('Erro ao atualizar postagem:', error.message);
        alert('Erro ao salvar as alterações.');
      }
    } else {
      alert('Título e conteúdo são obrigatórios.');
    }
  };

  // Quando o usuário clica em "Cancelar" ou no "X" para fechar
  document.getElementById('cancelEdit').onclick = closeModal;
  document.getElementById('closeModal').onclick = closeModal;

  function closeModal() {
    modal.style.display = 'none'; // Fecha o modal
  }
}

// Função para tornar o modal arrastável
export function makeModalDraggable(modalElement) {
  let isDragging = false;
  let offsetX = 0;
  let offsetY = 0;

  modalElement.querySelector('.modal-content').onmousedown = function (e) {
    isDragging = true;
    offsetX = e.clientX - modalElement.querySelector('.modal-content').offsetLeft;
    offsetY = e.clientY - modalElement.querySelector('.modal-content').offsetTop;

    document.onmousemove = function (e) {
      if (isDragging) {
        modalElement.querySelector('.modal-content').style.left = `${e.clientX - offsetX}px`;
        modalElement.querySelector('.modal-content').style.top = `${e.clientY - offsetY}px`;
      }
    };

    document.onmouseup = function () {
      isDragging = false;
      document.onmousemove = null;
    };
  };
}

// Quando o modal for exibido, torne-o arrastável
document.getElementById('editPostModal').style.position = 'absolute'; // Define como posicionamento absoluto para mover o modal
makeModalDraggable(document.getElementById('editPostModal'));


window.editPost = editPost;

window.deletePost=deletePost;


// Exporta as instâncias do Firestore, Auth, e App
export { db, auth, app, storage };

