// Importa funções e objetos necessários dos módulos do Firebase
import { addMessage, register, login, logout, auth, getUserData, updateUserData } from './firebase.js';
import { getDocs, collection, addDoc } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-storage.js";
import { db, storage } from './firebase.js'; 
import { doc, updateDoc, increment } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-firestore.js";
import { onSnapshot, query, orderBy } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-firestore.js";
import { testFirestore } from './firebase.js';
import { displayPosts } from './firebase.js' 
// Adiciona um evento que será executado quando o DOM estiver completamente carregado
document.addEventListener('DOMContentLoaded', () => {
    // Obtém referências para os elementos HTML
    const MAX_CHARACTERS = 200; // Limite de caracteres para o conteúdo
    const loginForm = document.getElementById('login-form');
    const loginBtn = document.getElementById('login-btn');
    const logoutBtn = document.getElementById('logout-btn');
    const q = query(collection(db, 'postagens'), orderBy('data', 'desc'));
    const formPostagem = document.getElementById('formPostagem');
    const userInfo = document.getElementById('user-info');
    const loginInfo = document.getElementById('login-btn');
    const userPhoto = document.getElementById('user-photo');
    const userDropdown = document.getElementById('user-dropdown');
    const postBtn = document.getElementById('post-btn');
    const editProfileForm = document.getElementById('edit-profile-form');
    const registerForm = document.getElementById('register-form');
    const messageContainer = document.getElementById('message-container');
    

    // Inicializa o armazenamento do Firebase
    const storage = getStorage();
// Exibe as postagens quando a página for carregada
 

    // 1. REGISTER FORM - Cadastra o usuário ao submeter o formulário de cadastro

    if (registerForm) {
        registerForm.addEventListener('submit', async (event) => {
            event.preventDefault(); // Impede o envio padrão do formulário
    
            console.log('Iniciando processo de cadastro...'); // Log inicial
    
            // Captura os dados do formulário de cadastro
            const fullname = document.getElementById('fullname').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirm-password').value;
            const phone = document.getElementById('phone').value;
            const birthdate = document.getElementById('birthdate').value;
            const gender = document.getElementById('gender').value;
    
            // Log dos dados capturados
            console.log('Dados do formulário:', { fullname, email, password, confirmPassword, phone, birthdate, gender });
    // Log das senhas para depuração
    console.log('Senha do usuário:', password);
    console.log('Confirmação de senha:', confirmPassword);
            // Valida se a senha e a confirmação de senha são iguais
            if (password !== confirmPassword) {
                alert('As senhas não coincidem. Por favor, tente novamente.');
                console.log('Erro: As senhas não coincidem');
                return;
            }
    
            try {
                console.log('Tentando registrar o usuário no Firebase Authentication...');
    
                // Tenta registrar o usuário no Firebase Authentication
                const user = await register(email, password);
    
                console.log('Usuário registrado com sucesso:', user);
    
                // Salva informações adicionais do usuário no Firestore
                console.log('Salvando dados adicionais do usuário no Firestore...');
                await updateUserData(user.uid, {
                    fullname,
                    phone,
                    birthdate,
                    gender
                });
    
                console.log('Dados adicionais do usuário salvos com sucesso.');
    
                // Exibe uma mensagem de sucesso e redireciona para a página principal
                alert('Usuário cadastrado com sucesso!');
                window.location.href = 'index.html'; // Redireciona após o cadastro
            } catch (error) {
                // Mostra uma mensagem de erro se o cadastro falhar
                console.error('Erro ao cadastrar usuário:', error.message);
                alert('Erro ao cadastrar usuário: ' + error.message);
            }
        });
    }
    if (loginForm) {
        loginForm.addEventListener('submit', async (event) => {
            event.preventDefault(); // Impede o envio padrão do formulário
            
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            
            console.log('Usuário:', username);
            console.log('Senha:', password);
            
            try {
              const user = await login(username, password); // Certifique-se de que `login` está importado e funcionando
              console.log('Usuário logado:', user);
              window.location.href = 'index.html'; // Redireciona após o login
            } catch (error) {
              alert('Erro ao fazer login: ' + error.message);
            }
        });
    } else {
        console.error('Formulário de login não encontrado.');
    }
   
      
      

    // 2. ABRIR/FECHAR DROPDOWN AO CLICAR NA FOTO
    if (userPhoto) {
        userPhoto.addEventListener('click', (event) => {
            event.stopPropagation(); // Impede que o clique se propague para outros elementos
            if (userDropdown.style.display === 'none') {
                userDropdown.style.display = 'block'; // Exibe o dropdown se estiver escondido
            } else {
                userDropdown.style.display = 'none'; // Oculta o dropdown se estiver visível
            }
        });
    }

    // 3. FECHAR DROPDOWN SE CLICAR FORA
    document.addEventListener('click', (event) => {
        if (!userDropdown.contains(event.target) && !userPhoto.contains(event.target)) {
            userDropdown.style.display = 'none'; // Oculta o dropdown se o clique não for dentro dele
        }
    });

    // 4. LOGIN BUTTON - Redireciona para a página de login se o usuário não estiver autenticado
    if (loginBtn) {
        loginBtn.addEventListener('click', () => {
            window.location.href = 'paginaLogin.html'; // Redireciona para a página de login
        });
    }

    // 5. LOGOUT BUTTON - Desconecta o usuário ao clicar no botão de logout
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
            try {
                await logout(); // Tenta desconectar o usuário
                displayMessage('Você foi desconectado com sucesso.', 'success');
                setTimeout(() => {
                    window.location.reload(); // Recarrega a página após a desconexão
                }, 1000);
            } catch (error) {
                console.error('Erro ao deslogar:', error.message);
                displayMessage('Erro ao deslogar. Tente novamente.', 'error'); // Mostra mensagem de erro se a desconexão falhar
            }
        });
    }

    // 6. AUTENTICAÇÃO - Observa mudanças no estado de autenticação e atualiza a UI
    auth.onAuthStateChanged((user) => {
        console.log('Estado de autenticação mudou:', user);
        updateUI(user); // Atualiza a interface do usuário com base no estado de autenticação
    });

    // Atualiza a interface do usuário com base na autenticação
    function updateUI(user) {
        // Verifica se os elementos existem
        if (!userInfo || !loginInfo) {
            console.error("Erro: Elementos de 'userInfo' ou 'loginInfo' não encontrados.");
            return;
        }

        if (user) {
            // Usuário autenticado
            console.log("Usuário autenticado:", user);
            userInfo.style.display = 'flex';  // Exibe as informações do usuário
            loginInfo.style.display = 'none';  // Esconde o botão de login
            userPhoto.src = user.photoURL || 'https://via.placeholder.com/50';  // Atualiza a foto do usuário
            postBtn.style.display = 'block';  // Mostra o botão de "Postar"
        } else {
            // Usuário não autenticado
            console.log("Nenhum usuário autenticado.");
            userInfo.style.display = 'none';  // Esconde as informações do usuário
            loginInfo.style.display = 'flex';  // Mostra o botão de login
            postBtn.style.display = 'none';  // Esconde o botão de "Postar"
        }
    }

    async function likePost(postId) {
        try {
            const postRef = doc(db, 'postagens', postId);
            // Incrementa o número de curtidas
            await updateDoc(postRef, { likes: increment(1) }); 
            
            // Encontra o elemento que mostra o número de curtidas para esta postagem
            const likeElement = document.querySelector(`[data-post-id='${postId}'] .like-count`);
            const currentLikes = parseInt(likeElement.textContent) || 0;
            likeElement.textContent = `${currentLikes + 1} curtidas`;
    
        } catch (error) {
            console.error('Erro ao curtir a postagem:', error);
            alert('Erro ao curtir a postagem.');
        }
    }
       


/// 7. POSTAGEM FORM - Lida com a criação de novas postagens
if (formPostagem) {
    const postImageInput = document.getElementById('post-image');
postImageInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    const imgPreview = document.querySelector('.img-preview');
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            if (imgPreview) {
                imgPreview.src = e.target.result;
            } else {
                const newImgPreview = document.createElement('img');
                newImgPreview.src = e.target.result;
                newImgPreview.classList.add('img-preview');
                document.querySelector('#formPostagem').appendChild(newImgPreview);
            }
        };
        reader.readAsDataURL(file);
    } else if (imgPreview) {
        imgPreview.remove();
    }
});

    formPostagem.addEventListener('submit', async (event) => {
    event.preventDefault(); // Impede o envio padrão do formulário
    
    const user = auth.currentUser; // Obtém o usuário logado
    
    if (!user) { 
        // Verifica se o usuário está logado
        alert('Você precisa estar logado para fazer uma postagem.');
        return;
    }

    const titulo = document.getElementById('titulo').value;
    const conteudo = document.getElementById('conteudo').value;
    const tags = document.getElementById('tags').value.split(',').map(tag => tag.trim());
    const postImage = document.getElementById('post-image').files[0];
    const MAX_CHARACTERS = 200; // Limite de caracteres para o conteúdo

    // Verifica se o conteúdo da postagem excede o limite de caracteres
    if (conteudo.length > MAX_CHARACTERS) {
        alert(`O conteúdo da postagem não pode exceder ${MAX_CHARACTERS} caracteres. Atualmente, você usou ${conteudo.length} caracteres.`);
        return;
    }

    try {
        let imageUrl = '';
        if (postImage) {
            const storageRef = ref(storage, `images/${postImage.name}`);
            await uploadBytes(storageRef, postImage); // Faz o upload da imagem para o Firebase Storage
            imageUrl = await getDownloadURL(storageRef); // Obtém a URL da imagem
        }

        // Adiciona a postagem ao Firestore
        await addDoc(collection(db, 'postagens'), {
            titulo,
            conteudo,
            imageUrl,
            tags,
            data: new Date(), // Adiciona a data da postagem
            likes: 0,
            uid: user.uid, // Usa o UID do usuário logado
        });

        alert('Postagem publicada com sucesso!');
        displayPosts(); // Recarrega as postagens sem redirecionar
        formPostagem.reset(); // Limpa o formulário
        window.location.href = 'index.html'; // Redireciona para a página principal após a postagem
    } catch (error) {
        console.error('Erro ao adicionar postagem:', error.message);
        alert('Erro ao publicar postagem. Verifique o console.');
    }
});


    // Feedback em tempo real para o número de caracteres
    const conteudoField = document.getElementById('conteudo');
    const charCount = document.createElement('p'); // Cria um elemento para o contador de caracteres
    charCount.id = 'char-count';
    charCount.textContent = `0/${MAX_CHARACTERS} caracteres`;
    conteudoField.parentNode.appendChild(charCount); // Adiciona o contador abaixo do campo de conteúdo

    conteudoField.addEventListener('input', () => {
        const currentLength = conteudoField.value.length;
        charCount.textContent = `${currentLength}/${MAX_CHARACTERS} caracteres`;

        // Altera a cor do texto do contador se o limite for excedido
        if (currentLength > MAX_CHARACTERS) {
            charCount.style.color = 'red'; // Muda a cor para vermelho se o limite for ultrapassado
        } else {
            charCount.style.color = 'black'; // Mantém preto se estiver dentro do limite
        }
    });
}

async function deletePost(postId) {
    if (confirm('Tem certeza que deseja excluir esta postagem?')) {
        try {
            await deleteDoc(doc(db, 'postagens', postId));
            alert('Postagem excluída com sucesso!');
            displayPosts(); // Atualiza a lista de postagens após a exclusão
        } catch (error) {
            console.error('Erro ao excluir a postagem:', error);
            alert('Erro ao excluir a postagem.');
        }
    }
}
function editPost(postId, currentTitle, currentContent, currentImageUrl) {
    // Preenche o formulário com os dados da postagem atual
    document.getElementById('titulo').value = currentTitle;
    document.getElementById('conteudo').value = currentContent;

    // Muda o comportamento do botão "Publicar" para "Atualizar"
    const submitButton = document.querySelector('button[type="submit"]');
    submitButton.textContent = 'Atualizar';

    // Remove o event listener anterior e adiciona o de "Atualizar"
    const formPostagem = document.getElementById('formPostagem');
    formPostagem.removeEventListener('submit', createPost); // Remove o listener antigo
    formPostagem.addEventListener('submit', async function updatePost(event) {
        event.preventDefault();

        const tituloAtualizado = document.getElementById('titulo').value;
        const conteudoAtualizado = document.getElementById('conteudo').value;

        try {
            // Atualiza a postagem no Firestore
            await updateDoc(doc(db, 'postagens', postId), {
                titulo: tituloAtualizado,
                conteudo: conteudoAtualizado,
                imageUrl: currentImageUrl // Mantém a imagem existente
            });

            alert('Postagem atualizada com sucesso!');
            displayPosts(); // Recarrega as postagens
            formPostagem.reset(); // Limpa o formulário
            submitButton.textContent = 'Publicar'; // Volta o botão para "Publicar"
            formPostagem.removeEventListener('submit', updatePost); // Remove o listener de atualização
            formPostagem.addEventListener('submit', createPost); // Volta o listener de criação de postagens

        } catch (error) {
            console.error('Erro ao atualizar postagem:', error);
            alert('Erro ao atualizar a postagem.');
        }
    });
}
 

    // 9. DISPLAY MESSAGE - Função auxiliar para exibir mensagens na tela
    function displayMessage(message, type) {
        if (messageContainer) {
            messageContainer.textContent = message;
            messageContainer.className = `alert alert-${type}`; // Define a classe CSS para o tipo de mensagem
            messageContainer.style.display = 'block'; // Mostra a mensagem
            setTimeout(() => {
                messageContainer.style.display = 'none'; // Esconde a mensagem após 5 segundos
            }, 5000);
        }
    }

    // 10. DISPLAY POSTS - Exibe as postagens quando a página for carregada
    

    // 11. EDITAR PERFIL - Lida com a atualização dos dados do perfil
    if (editProfileForm) {
        editProfileForm.addEventListener('submit', async (event) => {
            event.preventDefault(); // Impede o envio padrão do formulário
            const updatedData = {
                fullname: document.getElementById('fullname')?.value,
                phone: document.getElementById('phone')?.value,
                birthdate: document.getElementById('birthdate')?.value,
            };

            try {
                const user = auth.currentUser;
                if (user) {
                    await updateUserData(user.uid, updatedData); // Atualiza os dados do usuário no Firebase
                    displayMessage('Perfil atualizado com sucesso!', 'success');
                } else {
                    displayMessage('Usuário não está logado. Faça login para atualizar o perfil.', 'warning');
                }
            } catch (error) {
                console.error('Erro ao atualizar perfil:', error.message);
                displayMessage('Erro ao atualizar o perfil. Tente novamente.', 'error'); // Mostra mensagem de erro se a atualização falhar
            }
        });
    }

    // 12. REDIRECIONAR PARA EDITAR PERFIL
    const editProfileBtn = document.getElementById('edit-profile-btn');
    if (editProfileBtn) {
        editProfileBtn.addEventListener('click', () => {
            window.location.href = 'editarPerfil.html'; // Redireciona para a página de edição de perfil
        });
    }

    // 13. REDIRECIONAR PARA POSTAR
    const editPostar = document.getElementById('post-btn');
    if (editPostar) {
        editPostar.addEventListener('click', () => {
            window.location.href = 'post.html'; // Redireciona para a página de postagem
        });
    }
    
});



// Certifique-se de que essas funções estejam disponíveis globalmente
window.editPost = editPost;
window.deletePost = deletePost; 
window.addComment = addComment;

export {db, auth,  storage};
