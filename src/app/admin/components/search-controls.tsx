"use client";

import React from "react";
import {
  Box,
  Card,
  CardContent,
  Divider,
  Grid,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import TuneRoundedIcon from "@mui/icons-material/TuneRounded";
import GridViewRoundedIcon from "@mui/icons-material/GridViewRounded";
import TableRowsRoundedIcon from "@mui/icons-material/TableRowsRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import { SearchFiltersType, UserRole } from "./user-types";

import PersonAddRoundedIcon from "@mui/icons-material/PersonAddRounded";
interface SearchControlsProps {
  filters: SearchFiltersType;
  onFiltersChange: (filters: SearchFiltersType) => void;
  showAdvanced: boolean;
  onToggleAdvanced: () => void;
  viewMode: "cards" | "table";
  onViewModeChange: (mode: "cards" | "table") => void;
  onSearch: () => void;
  onRefresh?: () => void;
  onAddUser?: () => void;
}

export default function SearchControls({
  filters,
  onFiltersChange,
  showAdvanced,
  onToggleAdvanced,
  viewMode,
  onViewModeChange,
  onSearch,
  onRefresh,
  onAddUser,
}: SearchControlsProps) {
  return (
    <Card variant="outlined" sx={{ borderRadius: 3, mb: 3 }}>
      <CardContent>
        <Stack direction={{ xs: "column", md: "row" }} gap={2} alignItems="center">
          <TextField
            fullWidth
            placeholder="ค้นหาผู้ใช้งาน..."
            value={filters.keyword ?? ""}
            onChange={(e) => onFiltersChange({ ...filters, keyword: e.target.value })}
            onKeyDown={(e) => {
              if (e.key === "Enter") onSearch();
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchRoundedIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
          />
          <Stack direction="row" gap={1} alignItems="center" flexShrink={0}>
            <Button
              variant="contained"
              onClick={onSearch}
              sx={{ borderRadius: 2 }}
            >
              ค้นหา
            </Button>
            {onAddUser && (
              <Button
                variant="contained"
                color="success"
                onClick={onAddUser}
                startIcon={<PersonAddRoundedIcon />}
                sx={{ borderRadius: 2 }}
              >
                เพิ่มผู้ใช้
              </Button>
            )}
            {onRefresh && (
              <Tooltip title="รีเฟรชข้อมูล">
                <IconButton
                  onClick={onRefresh}
                  sx={{ border: "1px solid", borderColor: "divider", borderRadius: 2 }}
                >
                  <RefreshRoundedIcon />
                </IconButton>
              </Tooltip>
            )}
            <Tooltip title="ตัวกรองขั้นสูง">
              <IconButton
                onClick={onToggleAdvanced}
                sx={{ border: "1px solid", borderColor: "divider", borderRadius: 2 }}
              >
                <TuneRoundedIcon />
              </IconButton>
            </Tooltip>
            <ToggleButtonGroup
              exclusive
              size="small"
              value={viewMode}
              onChange={(_, v) => v && onViewModeChange(v)}
              sx={{
                ml: { md: 1 },
                borderRadius: 2,
                "& .MuiToggleButton-root": { px: 1.5 },
              }}
            >
              <ToggleButton value="cards" aria-label="card view">
                <GridViewRoundedIcon fontSize="small" />
              </ToggleButton>
              <ToggleButton value="table" aria-label="table view">
                <TableRowsRoundedIcon fontSize="small" />
              </ToggleButton>
            </ToggleButtonGroup>
          </Stack>
        </Stack>

        {/* Advanced Filters */}
        {showAdvanced && (
          <Box sx={{ mt: 2 }}>
            <Divider sx={{ mb: 2 }} />
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 6 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>บทบาท</InputLabel>
                  <Select
                    value={filters.role ?? ""}
                    label="บทบาท"
                    onChange={(e) => onFiltersChange({ ...filters, role: e.target.value as UserRole | "" })}
                  >
                    <MenuItem value="">ทั้งหมด</MenuItem>
                    <MenuItem value="admin">ผู้ดูแลระบบ</MenuItem>
                    <MenuItem value="lecturer">อาจารย์</MenuItem>
                    <MenuItem value="staff">เจ้าหน้าที่</MenuItem>
                    <MenuItem value="student">นักศึกษา</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>สถานะ</InputLabel>
                  <Select
                    value={filters.status ?? ""}
                    label="สถานะ"
                    onChange={(e) => onFiltersChange({ ...filters, status: e.target.value as "active" | "inactive" | "" })}
                  >
                    <MenuItem value="">ทั้งหมด</MenuItem>
                    <MenuItem value="active">ใช้งาน</MenuItem>
                    <MenuItem value="inactive">ไม่ใช้งาน</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}