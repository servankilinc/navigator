import { createSlice, PayloadAction } from '@reduxjs/toolkit' 

// componentler ile haberleşmede(dispatch) kullanılacak
interface AlertModalProps{
    message?: string | undefined;
    timeOut?: number | undefined;
    callback?: () => void;
}

interface SuccessModalUI {
    message: string;
    showStatus: boolean;
    timeOut: number;
    callback?: () => void | undefined; // undefined olursa callback yok
};

interface ErrorModalUI {
    message: string;
    showStatus: boolean;
    timeOut: number;
    callback?: () => void | undefined; // undefined olursa callback yok
};

interface StateUI {
    successModal: SuccessModalUI;
    errorModal: ErrorModalUI;
};

const initialState: StateUI = {
    successModal:{
        message: "İşlem Başarıyla Gerçekleşti",// "Process Completed Successfully",
        showStatus: false,
        timeOut: 3000,
    },
    errorModal: {
        message: "İşlem Sırasında Bir Sorun Oluştu!", //"An error occurred during processing!",
        showStatus: false,
        timeOut: 3000
    }
}

export const alertSlice = createSlice({
    name: 'alertSlice',
    initialState,
    reducers: {
        showAlertSuccess: (state, action: PayloadAction<AlertModalProps>) => {
            state.successModal.message = action.payload.message?? "İşlem Başarıyla Gerçekleşti";
            state.successModal.timeOut = action.payload.timeOut?? 3000;
            state.successModal.callback = action.payload.callback?? undefined;
            state.successModal.showStatus = true;
        },
        showAlertError: (state, action: PayloadAction<AlertModalProps>) => {
            state.errorModal.message = action.payload.message?? "İşlem Sırasında Bir Sorun Oluştu!";
            state.errorModal.timeOut = action.payload.timeOut?? 3000;
            state.errorModal.callback = action.payload.callback?? undefined;
            state.errorModal.showStatus = true;
        },
        closeAlertSuccess: (state) => {
            state.successModal.callback = undefined;
            state.successModal.showStatus = false;
        },
        closeAlertError: (state) => { 
            state.errorModal.callback = undefined;
            state.errorModal.showStatus = false; 
        }
    },
})

export const { showAlertSuccess, showAlertError, closeAlertSuccess, closeAlertError} = alertSlice.actions

export default alertSlice.reducer