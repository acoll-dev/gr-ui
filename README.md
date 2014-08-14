gr-validation
=============

Form Validation Directive


### Elements

#### gr-form

- gr-name: (string) "Nome único do formulário"
- gr-label-type: (string) "placeholder"/"inline" (default: "placeholder")
- gr-validate-method: (string) "onSubmit"/"onChange" (default: "onSubmit")
- gr-validate: (boolean) true/false (default: true)

Ex.: `<gr-form gr-name="my-form" gr-label-type="placeholder" gr-validate-method="onSubmit" gr-validate="true"></gr-input>`

#### gr-input

- gr-name: (string) "Nome único do campo"
- gr-type: (string) "text/password/email/date/etc... é relativo ao atributo type padrão do html (default: "text")
- gr-label: (string) "Etiqueta descritiva do campo"
- gr-icon: (string) "Classe referente ao icone" (default: null) (ex.: "fa fa-fw fa-lock")
- gr-mask: (string) "Nome da máscara a ser utilizada, tomando como referencia as regras descritas abaixo neste mesmo documento" (default: null)
- gr-value: (string) "Valor inicial do campo" (apenas para input de entrada de texto)
- gr-validate: (string) "Regras de validação para o input, tomando como referencia as regras abaixo, neste mesmo documento"

Ex.: `<gr-input gr-name="my-input" gr-type="text" gr-label="My Input Text" gr-icon="fa fa-fw fa-lock" gr-mask="## ####" gr-value="Initial value" gr-validate="required:true; maxlength:10"></gr-input>`
		
### Mask

#### Types

- `#`: Apenas números
- `A`: Apenas letras, maiúsculas ou minúsculas
- `a`: Apenas letras minúsculas
- `*`: Letras, maiúsculas ou minúsculas e/ou números

#### Resources

- `?`: Todos os caracteres a direita serão opcionais
- `&`: Deve ficar a frente do caracter a ser utilizado como referencia, o mesmo assumirá a "mask type" mais próxima encontrado a direita, ao digitar, ele auto incrementa o caracter referencia na sua própria posição
- `[[X||*]]`: Deve ficar a frente do caracter a ser utilizado como referencia, o mesmo assumirá a "mask type" mais próxima encontrado a direita, ele auto incrementa o caracter referencia na sua própria posição, caso haja divisor, ele será implementado cada vez que o delimitador for atingido, caso não haja um divisor, o delimitador limitará a implementação da mascára.
	- X: Reperensa o delimitador, deve conter um numérico inteiro maior que 1
	- *: Representa o divisor, deve conter qualquer caractér (exceto "]]"), em qualquer quantidade, caso seja necessário utilizar o caracter "\" é necessário definir duplicado, como "\\"
