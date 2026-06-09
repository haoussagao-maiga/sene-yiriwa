/**
 * hooks/useActions.ts
 * 
 * Hook personnalisé pour exporter facilement toutes les actions
 */

import { useDispatch } from 'react-redux';
import { bindActionCreators } from '@reduxjs/toolkit';
import * as authActions from '../store/slices/authSlice';
import * as userActions from '../store/slices/userSlice';
import * as appActions from '../store/slices/appSlice';

export const useActions = () => {
  const dispatch = useDispatch();
  
  return {
    auth: bindActionCreators(authActions, dispatch),
    user: bindActionCreators(userActions, dispatch),
    app: bindActionCreators(appActions, dispatch),
  };
};