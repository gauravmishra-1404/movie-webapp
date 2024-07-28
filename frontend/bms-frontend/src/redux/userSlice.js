import {createSlice} from '@reduxjs/toolkit';

const usersSlice = createSlice({
    name: "users",
    initialState: {
        user: null,
    },
    reducers: {
        setUser : (state, { payload }) => {
            console.log({ payload })
            state.user = payload;
        },
    }
});
export const {setUser} = usersSlice.actions;
export default usersSlice.reducer;