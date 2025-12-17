import React from 'react';

import Box from '@mui/material/Box';
import ListMUI from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';

/* 
  Simple List component. 
  For more complex lists (grid/masonry), we might want separate components.
*/

interface ListProps<T> {
    items: T[];
    renderItem: (item: T) => React.ReactNode;
    emptyMessage?: string;
}

const List = <T,>({ items, renderItem, emptyMessage = 'No items found' }: ListProps<T>) => {
    if (!items || items.length === 0) {
        return (
            <Box sx={{ p: 3, textAlign: 'center' }}>
                <Typography color="text.secondary">{emptyMessage}</Typography>
            </Box>
        );
    }

    return (
        <ListMUI sx={{ width: '100%', bgcolor: 'background.paper', borderRadius: 1 }}>
            {items.map((item, index) => (
                <React.Fragment key={index}>
                    <ListItem disablePadding>
                        {renderItem(item)}
                    </ListItem>
                    {index < items.length - 1 && <Divider component="li" />}
                </React.Fragment>
            ))}
        </ListMUI>
    );
};

export default List;
