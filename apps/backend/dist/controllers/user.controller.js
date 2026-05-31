"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateProfile = exports.deleteUser = exports.updateUserRole = exports.getUserById = exports.getAllUsers = void 0;
const prisma_1 = require("../lib/prisma");
const getAllUsers = async (req, res) => {
    try {
        const users = await prisma_1.prisma.user.findMany({
            select: { id: true, name: true, email: true, role: true, createdAt: true }
        });
        res.json({ users });
    }
    catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.getAllUsers = getAllUsers;
const getUserById = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = Array.isArray(id) ? id[0] : id;
        const user = await prisma_1.prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, name: true, email: true, role: true, createdAt: true }
        });
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }
        res.json({ user });
    }
    catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.getUserById = getUserById;
const updateUserRole = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = Array.isArray(id) ? id[0] : id;
        const { role } = req.body;
        if (!['ADMIN', 'OPERATOR', 'PASSENGER'].includes(role)) {
            res.status(400).json({ message: 'Invalid role' });
            return;
        }
        const user = await prisma_1.prisma.user.update({
            where: { id: userId },
            data: { role },
            select: { id: true, name: true, email: true, role: true }
        });
        res.json({ message: 'Role updated', user });
    }
    catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.updateUserRole = updateUserRole;
const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = Array.isArray(id) ? id[0] : id;
        await prisma_1.prisma.user.delete({ where: { id: userId } });
        res.json({ message: 'User deleted' });
    }
    catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.deleteUser = deleteUser;
const updateProfile = async (req, res) => {
    try {
        const { name, email } = req.body;
        const user = await prisma_1.prisma.user.update({
            where: { id: req.user.userId },
            data: { name, email },
            select: { id: true, name: true, email: true, role: true }
        });
        res.json({ message: 'Profile updated', user });
    }
    catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.updateProfile = updateProfile;
