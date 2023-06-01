
function outraForma(){

    // ---- capturando o token do roteador para utilizar nas requisições --------
    var token = document.getElementById("token")
    var token = token.value
    
    // ---- capturando o telefone digitado ----//
    var telefone = document.getElementById("telefone")
    var telefone = telefone.value
    
    //---capturando a ultima mensagem do usuário para ter como base na pesquisa automática de 30 dias
    const url = "https://http.msging.net/commands"
    const headersTake = {
   'Content-Type': 'application/json',
   'Authorization': token
  }
    const body = {  
        "id": "MarcosConsomeAPI",
        "method": "get",
        "uri": `/threads/${telefone}@wa.gw.msging.net?refreshExpiredMedia=true`
      }
    
    
    //---- Montando requisição para verificar a última mensagem -----
    
    function lestMessage() {
        
          axios.post(url, body, {headers: headersTake})
            .then(response => {
              const ultimoID = response.data.resource.items[0].id;
              console.log(ultimoID);
              
              
            //------------- Se der 200 na request mas items vir vazio (ocorre quando o número não existe)------
            if(ultimoID.length == 0){
              alert('[ERRO] - NÃO ENCONTRAMOS NADA COM ESSE NÚMERO')              
            } else{ 
              //--- deu certo! uhul, vamos agora trabalhar com esses dados.
              
              //--- setando menos 30 dias da data de hoje ----//
              data = new Date()
              data.setDate(data.getDate()-100) // mudei a data para -30 em dia //testando 365
               var dia = data.getDate()
               var mes = data.getMonth() +1
               var ano = data.getFullYear()
            if (dia.toString().length == 1){dia = '0' + dia}
            if (mes.toString().length == 1) {mes = '0' + mes}                
            var dataPesquisa = `${ano}-${mes}-${dia}`
  
          const bodyThreads = {  
          "id": "123123123121323d",
          "method": "get",
          "uri": `/threads/${telefone}@wa.gw.msging.net?$take=100&direction=desc&storageDate=${dataPesquisa}T00:00:00.000Z`
        }
        //--- fazendo a requisição das threads dos ultimos 30 dias, por tabela vem os ultimos 100
        axios.post(url, bodyThreads, {headers: headersTake})
        .then(response => {
          const threads = response.data.resource.items;
          const total = response.data.resource.total
          console.log(threads)
          
  
          //--apagando inputs, textos e botões do select--
          document.getElementById("txt").innerHTML = ""
  
          //--isenrindo carregar da página
          document.getElementById("loader-container").classList.remove("hidden");
          
          //--Inserindo botão de voltar
          const button = document.createElement("button");
            button.textContent = "Voltar";
            button.addEventListener("click", function() {
              
              window.location.href = "index.html";
            });
            document.body.appendChild(button);
  
            //---iserindo botão de download 
          const buttonDoc = document.createElement("button");
          buttonDoc.id = "baixar";
          buttonDoc.textContent = "Baixar Planilha";
          buttonDoc.addEventListener("click", function() {
            
            var exports = $("#tabela");
            exports.table2excel({
            filename: `Relatório ${telefone}`
              });
          });
          document.body.appendChild(buttonDoc);
  
          //-- colocando tabela --
  
          const table = document.createElement('table');
          const row = table.insertRow();
  
        //--- recuperar a mensagem pela requisição /message-templates ---
        const bodyTemplate = {
          "id": "123",
          "to": "postmaster@wa.gw.msging.net",
          "method": "get",
          "uri": "/message-templates" 
          }
        
        axios.post(url, bodyTemplate, {headers: headersTake})
      .then(response => {
        const itemsTemplate = response.data.resource.data;          
        console.log(itemsTemplate)
        // ajustando tamanho da section para ficar mais centralizado

        const sectionElement = document.querySelector('section');
        sectionElement.style.width = '1200px';
          var a = 0
          // Cria a linha de cabeçalho
            const headerRow = table.createTHead().insertRow();
            const typeHeader = headerRow.insertCell();
            const statusHeader = headerRow.insertCell(); 
            const contentHeader = headerRow.insertCell(); 
            const dataHeader = headerRow.insertCell();

            // Define o texto dos títulos em negrito
            typeHeader.innerHTML = "<b>Nome do template</b>";
            statusHeader.innerHTML = "<b>Status</b>";
            contentHeader.innerHTML = "<b>Conteúdo</b>";
            dataHeader.innerHTML = "<b>Data</b>"
          
        for (let i = total-1; i >= 0; i--) {
           if(threads[i].content.type == "template"){              
            a++
            console.log(a)
           //busca no array da request
           let  status = threads[i].status;
           
          switch (status) {
            case 'accepted':
              status = "Recebida 📍";
              break;
                
            case 'dispatched':
              status = "Enviada ➡";
              break;
                
            case 'received':
              status = "Entregue ✅";
              break;
                
            case 'consumed':
              status = "Lida ✅👀";
              break;
              
            case 'failed':
              status = "Falhou ❌";
              break;                 
            default:
              status = "Default";
          }
          
          

          const nomeTemplate = threads[i].content.template.name;
          //conteudo do template
          const conteudo = itemsTemplate.find(c => c.name == nomeTemplate);
if (conteudo.components) {
  if (conteudo.components[0].type == "BODY") {
    var conteudoTemplate = conteudo.components[0].text;
  } else {
    var conteudoTemplate = conteudo.components[1].text;
  }
} else {
  var conteudoTemplate = "Conteúdo deletado dos modelos";
}
            console.log(conteudo)

      //------captura a data-----
      const data = threads[i].date;
      var dataBR = new Date(data);
      var dataBR = dataBR.toLocaleString('pt-BR', {
        timeZone: 'America/Sao_Paulo'
      });

            //faz as linhas            
          const newRow = table.insertRow();
          const newTypeCell = newRow.insertCell();
          const newStatusCell = newRow.insertCell(); 
          const newContentCell = newRow.insertCell();
          const newDataCell = newRow.insertCell();

          
            //preenche as linhas
          newTypeCell.textContent = nomeTemplate;
          newStatusCell.textContent = status;   
          newContentCell.innerHTML = conteudoTemplate.replace(/\\n/g, '<br>');
          newDataCell.innerHTML = dataBR
          
        }    
        
           //var alk = threads[total-1].metadata["#uniqueId"]
           //var as = JSON.stringify(alk)           
           //var as = messageId.replace('\\', '').replace('"', '')
           var messageId = threads[total-1].id
        var storageDate = threads[total-1].date
        //proxima página (quando precisar)
        
        
        
        function nextPage(messageId,storageDate){

  

          
          var bodyNextPage = {  
            "id": "MarcosID123",
            "method": "get",
            "uri": `/threads/${telefone}@wa.gw.msging.net?$take=100&messageId=${messageId}&storageDate=${storageDate}`
          }
          
          var ajeita = bodyNextPage.uri.split("messageId=")[1]
          var ajeitafim = bodyNextPage.uri.split("messageId=")[0]
          var ajeita = ajeita.replace('\\', '').replace('"', '')
          var ajeita = ajeita.replace('\\', '').replace('"', '')
          var bodyNextPage = ajeitafim+'messageId='+ajeita
          
          var bodyNextPage = {  
            "id": "MarcosID123",
            "method": "get",
            "uri": `${bodyNextPage}`
            }
          
            axios.post(url, bodyNextPage, {headers: headersTake})
            .then(response => {
              console.log(response)
          const itemsTemplateNext = response.data.resource.items; 
          const totalNext = response.data.resource.total;
          console.log(itemsTemplateNext)
          
          var check = 0
          for (let i = 0; i < totalNext; i++) {
            
            if(itemsTemplateNext[i].content.type == "template"){
                check++
              //busca no array da request
            let statusNext = itemsTemplateNext[i].status;   
            
            switch (statusNext) {
              case 'accepted':
                statusNext = "Recebida 📍";
                break;
                  
              case 'dispatched':
                statusNext = "Enviada ➡";
                break;
                  
              case 'received':
                statusNext = "Entregue ✅";
                break;
                  
              case 'consumed':
                statusNext = "Lida ✅👀";
                break;
                
              case 'failed':
                statusNext = "Falhou ❌";
                break;                 
              default:
                statusNext = "Default";
            }
            
        
            const nomeTemplateNext = itemsTemplateNext[i].content.template.name;
            //conteudo do template
            const conteudo = itemsTemplate.find(c => c.name == nomeTemplateNext);
            if (conteudo && conteudo.components) {
              if (conteudo.components[0].type == "BODY"){
                var conteudoTemplateNext = conteudo.components[0].text
              } else{
                var conteudoTemplateNext = conteudo.components[1].text
              }
            } else {
              var conteudoTemplateNext = "Conteúdo deletado dos modelos"
            }

            //---- captura data, part2
            const data = itemsTemplateNext[i].date;
              var dataBR = new Date(data);
              var dataBR = dataBR.toLocaleString('pt-BR', {
              timeZone: 'America/Sao_Paulo'
            });
            
              //faz as linhas
            const newRow = table.insertRow(1);
            const newTypeCell = newRow.insertCell();
            const newStatusCell = newRow.insertCell(); 
            const newContentCell = newRow.insertCell();
            const newDataCell = newRow.insertCell();
            
              //preenche novas linhas
              newTypeCell.textContent = nomeTemplateNext;
              newStatusCell.textContent = statusNext;   
              newContentCell.innerHTML = conteudoTemplateNext.replace(/\\n/g, '<br>');
              newDataCell.innerHTML = dataBR
           
          }
        }//fecha loop de mensagens
        // verifica outra página 
        
        const IDfind = itemsTemplateNext[totalNext-1].id 
        
        if (IDfind !== ultimoID){
          
            if(itemsTemplateNext[total-1].type == "application/vnd.iris.ticket+json"){
              var metadado = itemsTemplateNext[total-1].id
            } if(itemsTemplateNext[total-1].type !== "application/vnd.iris.ticket+json"){ 
              var metadado = itemsTemplateNext[total-1].metadata['#uniqueId']
            }
                   
           
           var messageId = JSON.stringify(metadado)
           
           var storageDate = itemsTemplateNext[total-1].date
           nextPage(messageId,storageDate)
           console.log('inicando loop')        
          
         } else if (IDfind == ultimoID){
          if (check = 0){
            document.getElementById("txt").innerHTML = "Nenhuma mensagem ativa foi encontrada nos últimos 200 dias."
          }
          console.log('tudo certo!')
          document.getElementById("loader-container").classList.add("hidden");
        }
        
      })  
    }
  
        
        
        


}  
const IDfind = threads.find(t => t.id == ultimoID);
         
  if (IDfind == undefined){
           
    nextPage(messageId,storageDate)
           
         }  else {
          document.getElementById("loader-container").classList.add("hidden");
         }
        
         
      
          // imprime no html a lista
          
        const container = document.getElementById('dd');
        container.appendChild(table);
        

        
        
        //Checa se tem alguma mensagem
        if(a == 0 && IDfind !== undefined){
          document.getElementById("txt").innerHTML = "Nenhuma mensagem ativa foi encontrada nos últimos 200 dias."
        }
      
      } )
     
  })

}// fim else
       })  .catch(error => {
            console.log(error);
            
            alert('[ERRO] - TOKEN INCORRETO OU NÃO TEM HISTÓRICO')
          });
      ;
    }
    
   
    lestMessage()
    
}
