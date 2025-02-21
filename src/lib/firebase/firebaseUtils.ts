import { db } from './firebase';
import { doc, getDoc, setDoc, collection, getDocs, addDoc, deleteDoc, updateDoc } from 'firebase/firestore';

// Interface para os textos principais
export interface MainTexts {
  title: string;
  description: string;
}

// Função para inicializar os textos principais se não existirem
export const initializeMainTexts = async () => {
  const docRef = doc(db, 'settings', 'mainTexts');
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) {
    // Valores iniciais
    const initialTexts: MainTexts = {
      title: "Impulsionamos o futuro",
      description: "A be2ai é uma empresa inovadora, dedicada à transformação digital através da inteligência artificial. Desenvolvemos soluções personalizadas que combinam tecnologia de ponta com necessidades específicas do seu negócio."
    };

    // Criar documento com os valores iniciais
    await setDoc(docRef, initialTexts);
    return initialTexts;
  }

  return docSnap.data() as MainTexts;
};

// Função para obter os textos principais
export const getMainTexts = async (): Promise<MainTexts> => {
  try {
    const docRef = doc(db, 'settings', 'mainTexts');
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      // Se não existir, inicializa com os valores padrão
      return initializeMainTexts();
    }
    
    return docSnap.data() as MainTexts;
  } catch (error) {
    console.error('Erro ao obter textos:', error);
    throw new Error('Erro ao carregar os textos');
  }
};

// Função para atualizar os textos principais
export const updateMainTexts = async (texts: MainTexts): Promise<void> => {
  try {
    const docRef = doc(db, 'settings', 'mainTexts');
    await setDoc(docRef, texts);
  } catch (error) {
    console.error('Erro ao atualizar textos:', error);
    throw new Error('Erro ao salvar as alterações');
  }
}; 