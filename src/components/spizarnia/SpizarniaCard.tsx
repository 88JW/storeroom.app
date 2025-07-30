import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Box
} from '@mui/material';
import {
  MoreVert,
  Share,
  Edit,
  Delete
} from '@mui/icons-material';
import { ShareCodeManager } from '../sharing/ShareCodeManager';
import { designTokens } from '../../theme/appTheme';

interface SpizarniaCardProps {
  id: string;
  nazwa: string;
  description?: string;
  isOwner?: boolean;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onClick?: (id: string) => void;
}

export const SpizarniaCard: React.FC<SpizarniaCardProps> = ({
  id,
  nazwa,
  description,
  isOwner = true,
  onEdit,
  onDelete,
  onClick
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const open = Boolean(anchorEl);

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleEdit = () => {
    handleMenuClose();
    onEdit(id);
  };

  const handleShare = () => {
    handleMenuClose();
    setShareDialogOpen(true);
  };

  const handleDeleteClick = () => {
    handleMenuClose();
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    setDeleteDialogOpen(false);
    onDelete(id);
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
  };

  const handleCardClick = () => {
    if (onClick) {
      onClick(id);
    }
  };

  return (
    <>
      <Card
        onClick={handleCardClick}
        sx={{
          mb: 2,
          cursor: onClick ? 'pointer' : 'default',
          transition: 'all 0.2s ease',
          '&:hover': {
            transform: onClick ? 'translateY(-2px)' : 'none',
            boxShadow: onClick ? '0 8px 25px rgba(0,0,0,0.15)' : 'none'
          }
        }}
      >
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <div>
              <Typography 
                variant="h6" 
                sx={{ 
                  fontWeight: 600,
                  color: designTokens.colors.primary.main,
                  mb: description ? 1 : 0
                }}
              >
                {nazwa}
              </Typography>
              {description && (
                <Typography 
                  variant="body2" 
                  color="text.secondary"
                >
                  {description}
                </Typography>
              )}
            </div>
            <IconButton
              onClick={handleMenuClick}
              size="small"
              sx={{ ml: 1 }}
            >
              <MoreVert />
            </IconButton>
          </Box>
        </CardContent>
      </Card>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleMenuClose}
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
            minWidth: 150
          }
        }}
      >
        <MenuItem onClick={handleEdit}>
          <ListItemIcon>
            <Edit fontSize="small" />
          </ListItemIcon>
          <ListItemText>Edytuj</ListItemText>
        </MenuItem>
        
        {isOwner && (
          <MenuItem onClick={handleShare}>
            <ListItemIcon>
              <Share fontSize="small" />
            </ListItemIcon>
            <ListItemText>Udostępnij</ListItemText>
          </MenuItem>
        )}
        
        {isOwner && (
          <MenuItem 
            onClick={handleDeleteClick}
            sx={{ color: 'error.main' }}
          >
            <ListItemIcon>
              <Delete fontSize="small" sx={{ color: 'error.main' }} />
            </ListItemIcon>
            <ListItemText>Usuń</ListItemText>
          </MenuItem>
        )}
      </Menu>

      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        PaperProps={{
          sx: { borderRadius: 3 }
        }}
      >
        <DialogTitle>Usuń spiżarnię</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Czy na pewno chcesz usunąć spiżarnię "{nazwa}"? 
            Ta operacja nie może zostać cofnięta.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button 
            onClick={handleDeleteCancel}
            variant="outlined"
            sx={{ mr: 1 }}
          >
            Anuluj
          </Button>
          <Button 
            onClick={handleDeleteConfirm}
            variant="contained"
            color="error"
          >
            Usuń
          </Button>
        </DialogActions>
      </Dialog>

      <ShareCodeManager
        spizarniaId={id}
        spizarniaNazwa={nazwa}
        open={shareDialogOpen}
        onClose={() => setShareDialogOpen(false)}
      />
    </>
  );
};
