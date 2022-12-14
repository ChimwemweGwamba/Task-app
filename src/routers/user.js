const express = require('express')
const router = new express.Router()
const User = require('../models/user')
const auth = require('../middleware/auth')



// Add User
router.post('/users', async (req, res)  => {
    const user = new User(req.body)
    
    try {
        await user.save()
        const token = await user.generateAuthToken()
        res.status(201).send({ user, token })
    } catch (e) {
        res.status(400).send(e)
    }
})


router.post('/users/login', async (req, res) => {
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password)
        const token = await user.generateAuthToken()
        res.send({ token, user })
    } catch (e) {
        res.status(400).send()
    }
})


router.post('/users/logout', auth, async (req,res) => {
    try {
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token !== req.token
        })
        await req.user.save()

        res.send(200)
    } catch (e) {
        res.status(500).send()
    }
})

router.post('/users/logoutAll', auth, async (req,res) => {
    try {
    req.user.tokens = []
    await req.user.save()
    req.send()

    } catch (e) {
        res.status(500).send()
    }
})


// Get All Users
router.get('/users/me', auth, async (req, res)  => {
    res.send(req.user)
})



// Update user
router.patch('/users/me', auth, async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['name', 'email', 'password', 'age']
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update)
    )

    // Check if update contains required fields
    if (!isValidOperation) {
        return res.status(400).send({ error: 'invalid updates!'})
    }

    try {        
        updates.forEach((update) => user[update] = req.body[update])
        await req.user.save()
        res.send(req.user)
    }
    catch (e) {
        res.status(400).send(e)
    }
})


// Delete user
router.delete('/users/me', auth, async (req,res) => {
    try {

        await req.user.remove()
        res.send(req.user)

    } catch (e) {
        res.status(500).send(e)
    }
})


module.exports = router