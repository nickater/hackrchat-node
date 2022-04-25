import inquirer from 'inquirer';
import { emailQuestion, passwordQuestion } from '../utils/questions';
import { print } from '../utils/log';
import { authenticateUser } from '../services/auth/auth-service';
import { CoreProvider } from '../services/state/CoreProvider';
import { ViewResponse, ViewResponseType } from './types';
import { handleError } from '../utils/error-handler';

export const loginView = async (): Promise<ViewResponse> => {
  try {
    print('HackerChat Login');
    const { email, password } = await inquirer.prompt([emailQuestion, passwordQuestion]);
    const authenticationResponse = await authenticateUser({ email, password });
    if (authenticationResponse.user) {
      CoreProvider.instance.setUserId(authenticationResponse.user.uid);
    }
    const response = new ViewResponse(ViewResponseType.SUCCESS);
    return response;
  } catch (error) {
    handleError(error);
    const response = new ViewResponse(ViewResponseType.FAIL);
    return response;
  }
};
