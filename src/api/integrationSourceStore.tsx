import create from 'zustand';

interface ISourceCodeStore {
  sourceCode: string;
  setSourceCode: (val?: string) => void;
}

/**
 * Create context
 */
export const useSourceCodeStore = create<ISourceCodeStore>((set) => ({
  sourceCode: '',
  setSourceCode: (val?: string) => set({ sourceCode: val }),
}));
