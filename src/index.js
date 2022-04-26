const express = require('express')
const { v4: uuidv4 } = require('uuid')
const app = express()
app.use(express.json())

const dadosUser = [];

function verifyIfExistsAccountBi(req, resp, next) {
    const { bi } = req.headers
    const stament_user = dadosUser.find((user) => user.bi === bi)
    if (!stament_user) {
        return resp.json({
            erro: true,
            status: 'user not found😓',
        }, 404)
    }
    req.user = stament_user;
    return next()
}




app.post('/creat_account', (req, resp) => {
    const { bi, name } = req.body;
    const id = uuidv4();
    const is_exist_bi = dadosUser.some((user) => user.bi === bi)

    if (!is_exist_bi) {
        dadosUser.push({
            bi,
            name,
            id,
            stament: []
        })
        return resp.json({
            erro: false,
            status: 'user creat 😀'
        }).status(201)
    }
    return resp.json({
        erro: true,
        status: 'user no creat 😓',
        messagem: 'because the BI has already been taken'
    }, 401)
})

// app.use(verifyIfExistsAccountBi);
app.get('/staments', verifyIfExistsAccountBi, (req, resp) => {
    const { user } = req
    return resp.status(200).json(user)
})

app.post('/deposito', verifyIfExistsAccountBi, (req, resp) => {
    const { descricao, amount } = req.body
    const { user } = req

    const statementAction = {
        descricao,
        amount,
        created_At: new Intl.DateTimeFormat('pt-AO').format(new Date),
        type: "credit"
    }

    user.stament.push(statementAction)

    return resp.status(200).json(user)
})

function getStaments(staments) {
    const summary = staments.reduce((acc, transferencia) => {
        if (transferencia.type === 'credit') {
            return acc + Number(transferencia.amount)
        } else {
            return acc - Number(transferencia.amount)
        }
    }, 0)
    return summary;
}

app.post('/withdraw', verifyIfExistsAccountBi, (req, resp) => {
    const { amount } = req.body
    const { user } = req

    const balance = getStaments(user.stament)

    if (balance < amount) {
        return resp.json({
            erro: true,
            status: 'saldo insuficiente'
        }).status(201)
    }

    const statementAction = {
        descricao_: 'Retirada',
        amount,
        created_At: new Intl.DateTimeFormat('pt-AO').format(new Date),
        type: "debit"
    }

    user.stament.push(statementAction)
    return resp.status(200).json(user)
})


app.get('/staments/date', verifyIfExistsAccountBi, (req, resp) => {
    const { user } = req
    const { date } = req.query
    const dateFormat = date
    const stamentDate = user.stament.filter((stament) =>
        String(stament.created_At) === String(dateFormat)
    )

    return resp.status(200).json(stamentDate)
})


app.put('/account_actualizacao', verifyIfExistsAccountBi, (req, resp) => {
    const { user } = req
    const { name } = req.body
    user.name = name

    return resp.status(200).json(user)
})

app.delete('/delete_account', verifyIfExistsAccountBi, (req, resp) => {
    const { user } = req
    dadosUser.splice(user,1)

/*  var colors = ["red","blue","car","green"];
 var carIndex = colors.indexOf("car");//get  "car" index
 //remove car from the colors array
 colors.splice(carIndex, 1); // colors = ["red","blue","green"] */
//  user.splice(user, 1)

    return resp.status(200).json(dadosUser)
})


app.listen(3333, () => { console.log(' hostname: localhost:3333 😀', '\n servidor iniciado proximo nivel 🚀') })