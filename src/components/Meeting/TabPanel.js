import React from 'react';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import { Input, InputAdornment, IconButton } from '@material-ui/core';
import SendIcon from '@material-ui/icons/Send';

// const useStyles = makeStyles((theme) => ({
//     root: {
//         backgroundColor: theme.palette.background.paper,
//         width: 5,
//         height: 10000
//     },
// }));

export default function FullWidthTabs() {
    // const classes = useStyles();

    return (
        <div id='chats'>
            <div className="">
                <div className="display"></div>
                <Input class='chat-input' autocomplete="off" placeholder="Type message here..."
                    endAdornment={
                        <InputAdornment position="end" >
                            <IconButton id='send'> <SendIcon /></IconButton>
                        </InputAdornment>
                    }
                />
            </div>
        </div>
    );
}