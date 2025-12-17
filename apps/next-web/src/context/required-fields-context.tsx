import { createContext, useContext } from 'react';

const RequiredFieldsContext = createContext<string[]>([]);

export const useRequiredFields = () => useContext(RequiredFieldsContext);

export default RequiredFieldsContext;
