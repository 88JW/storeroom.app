import React from 'react';
import {
  TextField,
  InputAdornment,
  Box,
  Button
} from '@mui/material';
import { Search } from '@mui/icons-material';

interface SearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedFilter: string;
  onFilterChange: (filter: string) => void;
  filters?: string[];
  filterLabels?: Record<string, string>; // Mapa ID -> nazwa wyświetlana
}

export const SearchBar: React.FC<SearchBarProps> = ({
  searchQuery,
  onSearchChange,
  selectedFilter,
  onFilterChange,
  filters = ['wszystko', 'lodówka', 'zamrażarka', 'szafka'],
  filterLabels = {}
}) => {
  return (
    <Box sx={{ px: 2, pb: 2 }}>
      {/* 🔍 Wyszukiwarka */}
      <TextField
        fullWidth
        placeholder="Szukaj"
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Search sx={{ color: '#637488' }} />
            </InputAdornment>
          ),
        }}
        sx={{ mb: 2 }}
      />

      {/* 🏷️ Filtry */}
      <Box sx={{ 
        display: 'flex', 
        gap: 1, 
        overflowX: 'auto',
        '&::-webkit-scrollbar': { display: 'none' },
        scrollbarWidth: 'none'
      }}>
        {filters.map((filter) => {
          const displayName = filterLabels[filter] || filter.charAt(0).toUpperCase() + filter.slice(1);
          return (
            <Button
              key={filter}
              variant={selectedFilter === filter ? 'contained' : 'outlined'}
              size="small"
              onClick={() => onFilterChange(filter)}
              sx={{ 
                minWidth: 'auto',
                whiteSpace: 'nowrap',
                ...(selectedFilter !== filter && {
                  bgcolor: '#f0f2f4',
                  color: '#111418',
                  borderColor: 'transparent',
                  '&:hover': {
                    bgcolor: '#e5e7eb',
                    borderColor: 'transparent',
                  }
                })
              }}
            >
              {displayName}
            </Button>
          );
        })}
      </Box>
    </Box>
  );
};
