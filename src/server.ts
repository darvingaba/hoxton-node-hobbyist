import express from 'express'
import cors from 'cors'
import { PrismaClient} from '@prisma/client'

const prisma = new PrismaClient()
const app = express()
app.use(cors())
app.use(express.json())

const port = process.env.PORT || 3344

app.get('/users',async(req,res)=>{
    const users = await prisma.user.findMany({include:{Hobbies:true}})
    res.send(users)
})

app.get('/users/:id', async(req,res)=>{
    const id = Number(req.params.id)
    const user = await prisma.user.findUnique({where:{id},
      include:{Hobbies:true}
   })
    if(user){
        res.send(user)
    }else{
        res.status(404).send({error:"User not found"});
        
    }
})

app.post('/users', async(req,res)=>{
    const newUser = await prisma.user.create({
      data: {
        email: req.body.email,
        Hobbies: {
          connectOrCreate: req.body.Hobbies.map((hobby: any) => ({
            where:  {name: hobby },
            create: {name: hobby },
          })),
        },
      },
    });
    res.send(newUser)
})

app.delete('/users/:id',async(req,res)=>{
    const id = Number(req.params.id)
    const deleteUser = await prisma.user.delete({where:{ id }})
    res.send(deleteUser) 
})

app.patch('/users', async(req,res)=>{
  const email = req.body.email
  const hobby = req.body.name
const updated = await prisma.user.update(
  {where: {email} ,
  data:{
    Hobbies:{
      connectOrCreate:{
        where:{name:hobby},
        create:{name:hobby}
      }
    }}
  })
  res.send(updated)
})

app.get('/hobbies',async(req,res)=>{
    const hobbies = await prisma.hobbies.findMany({include:{user:true}})
    res.send(hobbies)
})

app.get("/hobbies/:id", async (req, res) => {
  const hobby = await prisma.hobbies.findUnique({
    where: { id: Number(req.params.id) },
    include:{user:true}
  });
  if (hobby) {
    res.send(hobby);
  } else {
    res.status(404).send({ error: "Hobby not found" });
  }
});

app.post("/hobbies", async (req, res) => {
  const newHobby = await prisma.hobbies.create({ 
    data:{
      name:req.body.name,
      user:{
        connectOrCreate:req.body.user.map((userr:any)=>({
          where:{email: userr},
          create:{email:userr}
        }))
      }
    }});
  res.send(newHobby);
});

app.delete("/hobbies/:id", async (req, res) => {
  const id = Number(req.params.id);
  const deleteHobby = await prisma.hobbies.delete({ where: { id } });
  res.send(deleteHobby);
});
app.patch("/updateUserForHobbies/", async (req, res) => {
  const hobby= req.body.name
  const email= req.body.email
const updated = await prisma.hobbies.update(
  {where:{name:hobby},
  data:{
    user:{
      connectOrCreate:{where:{email:email},create:{email:email}}
    }
  }
 }
)
  res.send(updated);
});


app.listen(port,()=>{
    console.log("server up")
})