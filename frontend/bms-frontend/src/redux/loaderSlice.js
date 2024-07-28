import {createSlice} from '@reduxjs/toolkit';

const loadersSlice = createSlice({
    name: "loaders",
    initialState: {
        loading: false,
    },
    reducers: {
        showLoading : (state) => {
            state.loading = true;
        },
        hideLoading : (state) => {
            state.loading = false;
        }
    }
});
export const {showLoading, hideLoading} = loadersSlice.actions;
export default loadersSlice.reducer;